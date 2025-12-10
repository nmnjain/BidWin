import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.proposal_service import generate_proposal_ppt, OUTPUT_DIR

router = APIRouter()

@router.post("/{rfp_id}/generate-proposal")
def generate_proposal(rfp_id: int, db: Session = Depends(get_db)):
    """
    Consolidates Tech + Pricing data into a PPTX.
    """
    result = generate_proposal_ppt(rfp_id, db)
    return result

@router.get("/download/{filename}")
def download_proposal(filename: str):
    """
    Allows the frontend to download the generated file.
    """
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )