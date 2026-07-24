import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.investigation_service import run_investigation
from api.auth import get_current_user

logger = logging.getLogger("finguard.api.investigation")

router = APIRouter()


class GraphData(BaseModel):
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []


class InvestigationRequest(BaseModel):
    risk_score: float
    risk_level: str
    cycles: List[Any] = []
    suspicious_accounts: List[Any] = []
    graph: Optional[GraphData] = None


@router.post("/investigation")
async def create_investigation(payload: InvestigationRequest, user=Depends(get_current_user)):
    """Receive graph analysis output and generate a full AI investigation."""
    try:
        result = await run_investigation(payload.model_dump())
        return result
    except RuntimeError as exc:
        logger.error("Investigation failed: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:  # noqa: BLE001
        logger.error("Unexpected investigation error: %s", exc)
        raise HTTPException(status_code=500, detail="Investigation failed")
