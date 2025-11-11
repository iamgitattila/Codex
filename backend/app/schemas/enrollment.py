from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EnrollmentCreate(BaseModel):
    course_id: int


class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    completed_at: Optional[datetime]
    payment_status: str

    class Config:
        from_attributes = True
