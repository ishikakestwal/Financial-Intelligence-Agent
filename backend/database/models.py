from pydantic import BaseModel
from typing import Optional


class Transaction(BaseModel):
    transaction_id: Optional[str] = None
    sender_hash: str
    receiver_hash: str
    amount: float
    timestamp: Optional[str] = None
    bank_name: Optional[str] = None
    risk_score: float = 0.0
    risk_level: str = "LOW"


class Investigation(BaseModel):
    investigation_id: Optional[str] = None
    created_at: Optional[str] = None
    risk_score: float = 0.0
    summary: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str
