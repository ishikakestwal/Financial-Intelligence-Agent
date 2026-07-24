import io
import logging

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from database.supabase import get_admin_client
from privacy.anonymizer import anonymize_dataframe
from utils.helpers import parse_timestamp

logger = logging.getLogger("finguard.upload")

router = APIRouter()

REQUIRED_COLUMNS = {"sender", "receiver", "amount", "timestamp"}


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Accept a CSV of raw transactions, anonymize it, and store it in Supabase."""

    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        df.columns = df.columns.str.strip().str.lower()
    except Exception as exc:
        logger.warning("Failed to parse CSV %s: %s", file.filename, exc)
        raise HTTPException(status_code=400, detail="Could not parse CSV file")

    if not REQUIRED_COLUMNS.issubset(df.columns):
        raise HTTPException(
            status_code=422,
            detail=f"CSV must contain columns: {sorted(REQUIRED_COLUMNS)}",
        )

    # Anonymize data before storing
    df = anonymize_dataframe(df)
    df["timestamp"] = df["timestamp"].astype(str).apply(parse_timestamp)

    columns = ["sender_hash", "receiver_hash", "amount", "timestamp"]

    if "bank_name" in df.columns:
        columns.append("bank_name")

    records = df[columns].to_dict(orient="records")

    try:
        client = get_admin_client()
        client.table("transactions").insert(records).execute()
    except Exception as exc:
        logger.error("Failed to insert transactions: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to store transactions")

    logger.info("Stored %d transactions from %s", len(records), file.filename)

    return {
        "success": True,
        "message": "CSV uploaded successfully",
        "inserted": len(records),
    }