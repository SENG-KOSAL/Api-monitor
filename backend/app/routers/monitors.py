from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import HttpUrl

from app.database.connection import SessionLocal
from app.model.monitor import Monitor
from app.model.check_result import CheckResult
from app.schemas.monitor import MonitorCreate, MonitorUpdate, MonitorResponse
from app.schemas.check_result import CheckResultResponse
from app.services import check_health


router = APIRouter(
    prefix="/monitors",
    tags=["monitors"],
    responses={404: {"description": "Not found"}},
)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[MonitorResponse])
def get_monitors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all monitors with pagination.
    """
    monitors = db.query(Monitor).offset(skip).limit(limit).all()
    return monitors


@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(monitor_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific monitor by ID.
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")
    return monitor


@router.post("/", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED)
def create_monitor(monitor: MonitorCreate, db: Session = Depends(get_db)):
    """
    Create a new monitor.
    """
    # Check if monitor with same name already exists
    existing_monitor = db.query(Monitor).filter(Monitor.name == monitor.name).first()
    if existing_monitor:
        raise HTTPException(
            status_code=400,
            detail="Monitor with this name already exists"
        )
    
    # Convert HttpUrl to string for SQLAlchemy
    monitor_data = monitor.model_dump()
    if isinstance(monitor_data.get('url'), HttpUrl):
        monitor_data['url'] = str(monitor_data['url'])
    db_monitor = Monitor(**monitor_data)
    db.add(db_monitor)
    db.commit()
    db.refresh(db_monitor)
    return db_monitor


@router.put("/{monitor_id}", response_model=MonitorResponse)
def update_monitor(monitor_id: int, monitor: MonitorUpdate, db: Session = Depends(get_db)):
    """
    Update an existing monitor.
    """
    db_monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if db_monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")
    
    # Check if name is being updated and if it conflicts with another monitor
    if monitor.name and monitor.name != db_monitor.name:
        existing_monitor = db.query(Monitor).filter(Monitor.name == monitor.name).first()
        if existing_monitor:
            raise HTTPException(
                status_code=400,
                detail="Monitor with this name already exists"
            )
    
    # Update only the fields that were provided
    update_data = monitor.model_dump(exclude_unset=True)
    # Convert HttpUrl to string for SQLAlchemy
    if 'url' in update_data and isinstance(update_data['url'], HttpUrl):
        update_data['url'] = str(update_data['url'])
    for field, value in update_data.items():
        setattr(db_monitor, field, value)
    
    db.commit()
    db.refresh(db_monitor)
    return db_monitor


@router.post("/{monitor_id}/check", response_model=CheckResultResponse)
def check_monitor_health(monitor_id: int, db: Session = Depends(get_db)):
    """
    Perform a health check on a specific monitor.
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")
    
    # Perform the health check
    result = check_health(monitor.url)

    # Persist as CheckResult row
    check_result = CheckResult(
        monitor_id=monitor.id,
        status_code=result["status_code"],
        response_time=result["response_time"],
        error=result["error"],
    )
    db.add(check_result)
    db.commit()
    db.refresh(check_result)

    return check_result


@router.delete("/{monitor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_monitor(monitor_id: int, db: Session = Depends(get_db)):
    """
    Delete a monitor.
    """
    db_monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if db_monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")
    
    db.delete(db_monitor)
    db.commit()
    return None