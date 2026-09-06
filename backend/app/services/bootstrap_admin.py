import logging
import os

from app.database.connection import SessionLocal
from app.model.user import User, UserRole
from app.services.security import hash_password

logger = logging.getLogger(__name__)


def bootstrap_first_admin() -> None:
    """
    Runs once on every startup. Controlled by two env vars:

      FIRST_ADMIN_EMAIL     — the account to make an admin.
      FIRST_ADMIN_PASSWORD  — only used if that account doesn't exist yet.

    Behavior:
      - Account already exists            -> just makes sure role=admin.
        FIRST_ADMIN_PASSWORD is ignored here; an existing password is never
        overwritten by an env var.
      - Account doesn't exist, password given -> creates it outright with
        that password, role=admin, ready to log in with immediately.
      - Account doesn't exist, no password    -> logs a note and does
        nothing; nothing to create it from.

    This only ever touches the one account named by FIRST_ADMIN_EMAIL —
    every other user's role stays exactly as admins set it via
    /api/admin/users.
    """
    email = os.getenv("FIRST_ADMIN_EMAIL")
    if not email:
        return

    password = os.getenv("FIRST_ADMIN_PASSWORD")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()

        if user is None:
            if not password:
                logger.warning(
                    "FIRST_ADMIN_EMAIL=%s is set but no account with that "
                    "email exists yet, and FIRST_ADMIN_PASSWORD isn't set "
                    "so one can't be created automatically. Register this "
                    "account normally, or set FIRST_ADMIN_PASSWORD too and "
                    "restart.",
                    email,
                )
                return

            user = User(
                email=email,
                full_name="Admin",
                hashed_password=hash_password(password),
                role=UserRole.ADMIN,
            )
            db.add(user)
            db.commit()
            logger.info(
                "Created admin account %s (via FIRST_ADMIN_EMAIL / "
                "FIRST_ADMIN_PASSWORD).",
                email,
            )
            return

        if user.role != UserRole.ADMIN:
            user.role = UserRole.ADMIN
            db.commit()
            logger.info("Promoted %s to admin (via FIRST_ADMIN_EMAIL).", email)
    finally:
        db.close()
