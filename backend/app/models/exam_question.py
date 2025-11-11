from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # ["Option A", "Option B", "Option C", "Option D"]
    correct_answer = Column(Integer, nullable=False)  # index of correct option (0-3)
    difficulty = Column(String, default="medium")  # easy, medium, hard
    explanation = Column(Text, nullable=True)

    # Relationships
    course = relationship("Course", back_populates="exam_questions")
