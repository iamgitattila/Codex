from pydantic import BaseModel
from datetime import datetime


class CertificateResponse(BaseModel):
    id: int
    certificate_number: str
    verification_code: str
    issued_at: datetime
    exam_score: int
    course_title: str
    student_name: str

    class Config:
        from_attributes = True
