import logging
import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from database.supabase import get_admin_client
from reports.pdf_generator import generate_pdf
from api.auth import get_current_user

logger = logging.getLogger("finguard.api.reports")

router = APIRouter()


@router.get("/report/{investigation_id}")
async def get_report(investigation_id: str, user=Depends(get_current_user)):
    """Fetch an investigation, generate a PDF report, and return it as a download."""
    client = get_admin_client()
    try:
        result = (
            client.table("investigations")
            .select("*")
            .eq("investigation_id", investigation_id)
            .single()
            .execute()
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to fetch investigation %s: %s", investigation_id, exc)
        raise HTTPException(status_code=404, detail="Investigation not found")

    data = result.data
    if not data:
        raise HTTPException(status_code=404, detail="Investigation not found")

    try:
        pdf_path = generate_pdf(investigation_id, data)
    except Exception as exc:  # noqa: BLE001
        logger.error("PDF generation failed for %s: %s", investigation_id, exc)
        raise HTTPException(status_code=500, detail="Failed to generate report")

    # Persist report record in Supabase.
    try:
        client.table("reports").insert(
            {"investigation_id": investigation_id, "content": data}
        ).execute()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not persist report record: %s", exc)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(pdf_path),
    )
