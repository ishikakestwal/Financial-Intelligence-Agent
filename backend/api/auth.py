import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database.supabase import get_client
from database.models import LoginRequest

logger = logging.getLogger("finguard.auth")

router = APIRouter()
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate the bearer token against Supabase and return the user."""
    token = credentials.credentials
    client = get_client()
    try:
        user = client.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user.user
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.warning("Token validation failed: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/auth/login")
async def login(payload: LoginRequest):
    """Authenticate with email/password and return a Supabase access token."""
    client = get_client()
    try:
        res = client.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
        return {
            "access_token": res.session.access_token,
            "token_type": "bearer",
        }
    except Exception as exc:  # noqa: BLE001
        logger.warning("Login failed for %s: %s", payload.email, exc)
        raise HTTPException(status_code=401, detail="Invalid credentials")
