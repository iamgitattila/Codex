from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from io import BytesIO

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.certificate import Certificate
from app.schemas.certificate import CertificateResponse
from app.services.certificate_generator import generate_certificate_pdf

router = APIRouter()


@router.get("/my-certificates", response_model=List[CertificateResponse])
def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all certificates for the current user"""
    certificates = db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).all()

    # Enrich with course and user data
    result = []
    for cert in certificates:
        result.append({
            "id": cert.id,
            "certificate_number": cert.certificate_number,
            "verification_code": cert.verification_code,
            "issued_at": cert.issued_at,
            "exam_score": cert.exam_score,
            "course_title": cert.course.title,
            "student_name": cert.user.full_name
        })

    return result


@router.get("/{certificate_id}", response_model=CertificateResponse)
def get_certificate(certificate_id: int, db: Session = Depends(get_db)):
    """Get certificate details (public - for verification)"""
    certificate = db.query(Certificate).filter(
        Certificate.id == certificate_id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    return {
        "id": certificate.id,
        "certificate_number": certificate.certificate_number,
        "verification_code": certificate.verification_code,
        "issued_at": certificate.issued_at,
        "exam_score": certificate.exam_score,
        "course_title": certificate.course.title,
        "student_name": certificate.user.full_name
    }


@router.get("/verify/{verification_code}", response_model=CertificateResponse)
def verify_certificate(verification_code: str, db: Session = Depends(get_db)):
    """Verify a certificate by verification code (public)"""
    certificate = db.query(Certificate).filter(
        Certificate.verification_code == verification_code
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    return {
        "id": certificate.id,
        "certificate_number": certificate.certificate_number,
        "verification_code": certificate.verification_code,
        "issued_at": certificate.issued_at,
        "exam_score": certificate.exam_score,
        "course_title": certificate.course.title,
        "student_name": certificate.user.full_name
    }


@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download certificate as PDF"""
    certificate = db.query(Certificate).filter(
        Certificate.id == certificate_id,
        Certificate.user_id == current_user.id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    # Generate PDF
    pdf_buffer = generate_certificate_pdf(certificate, db)

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=certificate_{certificate.certificate_number}.pdf"
        }
    )
