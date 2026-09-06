from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import HttpUrl

from app.dependencies import get_current_user, get_db
from app.model.monitor import Monitor
from app.model.check_result import CheckResult
from app.model.incident import Incident
from app.model.user import User
from app.schemas.monitor import MonitorCreate, MonitorUpdate, MonitorResponse
from app.schemas.check_result import CheckResultResponse
from app.schemas.incident import IncidentResponse
from app.schemas.uptime import MonitorUptime
from app.services import check_health, calculate_uptime, build_auth_headers
from app.services.detect_incidents import detect_incident
from app.services.scheduler import scheduler


router = APIRouter(
    prefix="/monitors",
    tags=["monitors"],
    responses={404: {"description": "Not found"}},
)


def _get_owned_monitor(db: Session, monitor_id: int, current_user: User) -> Monitor:
    """
    Fetch a monitor by id, scoped to the current user. Returns 404 (not 403)
    when it exists but belongs to someone else, so a request can't be used
    to probe which monitor ids exist for other accounts.
    """
    monitor = (
        db.query(Monitor)
        .filter(Monitor.id == monitor_id, Monitor.user_id == current_user.id)
        .first()
    )
    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")
    return monitor


@router.get("/", response_model=List[MonitorResponse])
def get_monitors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve the current user's monitors, with pagination.
    """
    monitors = (
        db.query(Monitor)
        .filter(Monitor.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return monitors


@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a specific monitor by ID. Must belong to the current user.
    """
    return _get_owned_monitor(db, monitor_id, current_user)


@router.post("/", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED)
def create_monitor(
    monitor: MonitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new monitor owned by the current user.
    """
    # Monitor names only need to be unique per-user, not globally.
    existing_monitor = (
        db.query(Monitor)
        .filter(Monitor.name == monitor.name, Monitor.user_id == current_user.id)
        .first()
    )
    if existing_monitor:
        raise HTTPException(
            status_code=400,
            detail="You already have a monitor with this name"
        )

    # Convert HttpUrl to string for SQLAlchemy
    monitor_data = monitor.model_dump()
    if isinstance(monitor_data.get('url'), HttpUrl):
        monitor_data['url'] = str(monitor_data['url'])
    db_monitor = Monitor(**monitor_data, user_id=current_user.id)
    db.add(db_monitor)
    db.commit()
    db.refresh(db_monitor)

    scheduler.add_monitor(db_monitor)

    return db_monitor


@router.put("/{monitor_id}", response_model=MonitorResponse)
def update_monitor(
    monitor_id: int,
    monitor: MonitorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing monitor. Must belong to the current user.
    """
    db_monitor = _get_owned_monitor(db, monitor_id, current_user)

    # Check if name is being updated and if it conflicts with another of this
    # user's monitors.
    if monitor.name and monitor.name != db_monitor.name:
        existing_monitor = (
            db.query(Monitor)
            .filter(Monitor.name == monitor.name, Monitor.user_id == current_user.id)
            .first()
        )
        if existing_monitor:
            raise HTTPException(
                status_code=400,
                detail="You already have a monitor with this name"
            )
    
    # Update only the fields that were provided
    update_data = monitor.model_dump(exclude_unset=True)
    # Convert HttpUrl to string for SQLAlchemy
    if 'url' in update_data and isinstance(update_data['url'], HttpUrl):
        update_data['url'] = str(update_data['url'])
    
    # Handle authentication fields logic
    if update_data.get('auth_type') == 'none':
        update_data['auth_token'] = None
        update_data['auth_username'] = None
        update_data['auth_password'] = None
    elif update_data.get('auth_type') == 'bearer':
        token = update_data.get('auth_token', db_monitor.auth_token)
        if not token or not token.strip():
            raise HTTPException(
                status_code=400,
                detail="Bearer token is required when authentication type is 'bearer'"
            )
        update_data['auth_token'] = token.strip()
        update_data['auth_username'] = None
        update_data['auth_password'] = None
    elif update_data.get('auth_type') == 'basic':
        username = update_data.get('auth_username', db_monitor.auth_username)
        password = update_data.get('auth_password', db_monitor.auth_password)
        if not username or not username.strip():
            raise HTTPException(
                status_code=400,
                detail="Username is required when authentication type is 'basic'"
            )
        if not password or not password.strip():
            raise HTTPException(
                status_code=400,
                detail="Password is required when authentication type is 'basic'"
            )
        update_data['auth_username'] = username.strip()
        update_data['auth_password'] = password.strip()
        update_data['auth_token'] = None
    elif update_data.get('auth_type') is None:
        if db_monitor.auth_type == 'bearer' and 'auth_token' in update_data:
            if not update_data['auth_token'] or not update_data['auth_token'].strip():
                raise HTTPException(
                    status_code=400,
                    detail="Bearer token cannot be empty when authentication type is 'bearer'"
                )
            update_data['auth_token'] = update_data['auth_token'].strip()
        elif db_monitor.auth_type == 'basic':
            if 'auth_username' in update_data:
                if not update_data['auth_username'] or not update_data['auth_username'].strip():
                    raise HTTPException(
                        status_code=400,
                        detail="Username cannot be empty when authentication type is 'basic'"
                    )
                update_data['auth_username'] = update_data['auth_username'].strip()
            if 'auth_password' in update_data:
                if not update_data['auth_password'] or not update_data['auth_password'].strip():
                    raise HTTPException(
                        status_code=400,
                        detail="Password cannot be empty when authentication type is 'basic'"
                    )
                update_data['auth_password'] = update_data['auth_password'].strip()

    for field, value in update_data.items():
        setattr(db_monitor, field, value)
    
    db.commit()
    db.refresh(db_monitor)

    scheduler.update_monitor(db_monitor)

    return db_monitor


# ---------------------------------------------------------------------------
# NOTE: the endpoints below (check / results / uptime / incidents) are not
# part of the currently-required protected set, so they're left open for now.
# They still look up monitors without scoping to a user, which means a
# monitor's check history / uptime / incidents can be read (not modified) by
# anyone who knows its id. Recommended next step: apply the same
# get_current_user + _get_owned_monitor pattern used above to these too.
# ---------------------------------------------------------------------------

@router.post("/{monitor_id}/check", response_model=CheckResultResponse)
def check_monitor_health(monitor_id: int, db: Session = Depends(get_db)):
    """
    Perform a health check on a specific monitor.
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")
    
    # Perform the health check with authentication headers if configured
    headers = build_auth_headers(
        monitor.auth_type,
        monitor.auth_token,
        monitor.auth_username,
        monitor.auth_password,
    )
    result = check_health(monitor.url, headers=headers)

    # Persist as CheckResult row
    check_result = CheckResult(
        monitor_id=monitor.id,
        status_code=result["status_code"],
        reason_phrase=result.get("reason_phrase"),
        response_time=result["response_time"],
        error=result["error"],
        headers=result.get("headers"),
        body=result.get("body"),
    )
    db.add(check_result)
    db.commit()
    db.refresh(check_result)

    detect_incident(db, monitor, check_result)
    db.commit()

    return check_result


@router.get("/{monitor_id}/results", response_model=List[CheckResultResponse])
def get_monitor_results(
    monitor_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Retrieve health check history for a specific monitor.
    Results are ordered by most recent first, bounded by limit.
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")

    results = (
        db.query(CheckResult)
        .filter(CheckResult.monitor_id == monitor_id)
        .order_by(CheckResult.checked_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return results


@router.get("/{monitor_id}/uptime", response_model=MonitorUptime)
def get_monitor_uptime(monitor_id: int, db: Session = Depends(get_db)):
    """
    Calculate uptime percentage for a monitor over the last 24h, 7d, and 30d.
    A check counts as "up" only when it has no error and its status code
    falls within the 2xx or 3xx range.
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")

    return calculate_uptime(db, monitor_id)


@router.get("/{monitor_id}/incidents/active", response_model=List[IncidentResponse])
def get_active_incidents(monitor_id: int, db: Session = Depends(get_db)):
    """
    Retrieve currently open incidents for a monitor (live dashboard card).
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")

    incidents = (
        db.query(Incident)
        .filter(Incident.monitor_id == monitor_id, Incident.status == "open")
        .order_by(Incident.started_at.desc())
        .all()
    )
    return incidents


@router.get("/{monitor_id}/incidents", response_model=List[IncidentResponse])
def get_incidents(
    monitor_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    Retrieve incident history for a monitor, ordered by most recent first.
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    if monitor is None:
        raise HTTPException(status_code=404, detail="Monitor not found")

    incidents = (
        db.query(Incident)
        .filter(Incident.monitor_id == monitor_id)
        .order_by(Incident.started_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return incidents


@router.delete("/{monitor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a monitor. Must belong to the current user.
    """
    db_monitor = _get_owned_monitor(db, monitor_id, current_user)

    scheduler.remove_monitor(monitor_id)

    db.delete(db_monitor)
    db.commit()
    return None
