import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from ai.ai_router import chat
from api.auth import get_current_user

logger = logging.getLogger("finguard.api.ai_chat")

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    context: Optional[Dict[str, Any]] = None


@router.post("/chat")
async def investigator_chat(payload: ChatRequest, user=Depends(get_current_user)):
    """Accept an investigator question and return an AI-powered response."""
    try:
        answer = await chat(payload.question, payload.context)
        return {"answer": answer}
    except RuntimeError as exc:
        logger.error("Chat failed: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
