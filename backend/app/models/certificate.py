from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.session import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    certificate_number = Column(String, unique=True, index=True, nullable=False)
    verification_code = Column(String, unique=True, index=True, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    exam_score = Column(Integer, nullable=False)

    # Relationships
    user = relationship("User", back_populates="certificates")
    course = relationship("Course", back_populates="certificates")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.certificate_number:
            self.certificate_number = f"AICERT-{uuid.uuid4().hex[:12].upper()}"
        if not self.verification_code:
            self.verification_code = uuid.uuid4().hex.upper()
