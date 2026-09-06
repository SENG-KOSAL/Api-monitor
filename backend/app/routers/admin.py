from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_admin
from app.model.monitor import Monitor
from app.model.user import User, UserRole
from app.schemas.admin import PlatformOverview, UserRoleUpdate, UserStatusUpdate
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    responses={403: {"description": "Admin access required"}},
)


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/overview", response_model=PlatformOverview)
def get_platform_overview(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """High-level counts for the admin dashboard's landing page."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active.is_(True)).count()
    admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
    total_monitors = db.query(Monitor).count()
    active_monitors = db.query(Monitor).filter(Monitor.is_active.is_(True)).count()

    return PlatformOverview(
        total_users=total_users,
        active_users=active_users,
        disabled_users=total_users - active_users,
        admin_count=admin_count,
        developer_count=total_users - admin_count,
        total_monitors=total_monitors,
        active_monitors=active_monitors,
    )


@router.get("/users", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List every user on the platform, most recently created first."""
    return (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return _get_user_or_404(db, user_id)


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    body: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Enable or disable a user's account. A disabled account is blocked at
    login and at every authenticated request (see get_current_user).
    """
    user = _get_user_or_404(db, user_id)

    if user.id == admin.id and not body.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't disable your own account",
        )

    user.is_active = body.is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    body: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Promote or demote a user between DEVELOPER and ADMIN. An admin can't
    change their own role — that's how you'd accidentally lock every admin
    out of /api/admin at once.
    """
    user = _get_user_or_404(db, user_id)

    if user.id == admin.id and body.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't change your own role",
        )

    user.role = body.role
    db.commit()
    db.refresh(user)
    return user
