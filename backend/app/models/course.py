from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    level = Column(String, nullable=False)  # beginner, intermediate, advanced
    duration = Column(String, nullable=False)  # e.g., "4 weeks", "2 hours"
    pass_percentage = Column(Integer, default=70)
    exam_duration = Column(Integer, default=60)  # minutes
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Course content
    syllabus = Column(Text, nullable=True)  # JSON or markdown
    learning_outcomes = Column(Text, nullable=True)  # JSON

    # Relationships
    enrollments = relationship("Enrollment", back_populates="course")
    exam_questions = relationship("ExamQuestion", back_populates="course")
    exam_attempts = relationship("ExamAttempt", back_populates="course")
    certificates = relationship("Certificate", back_populates="course")
