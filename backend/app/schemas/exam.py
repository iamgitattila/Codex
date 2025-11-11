from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime


class ExamQuestionResponse(BaseModel):
    id: int
    question_text: str
    options: List[str]
    # Note: We don't send correct_answer to the frontend

    class Config:
        from_attributes = True


class ExamSubmission(BaseModel):
    answers: Dict[int, int]  # {question_id: selected_answer_index}


class ExamAttemptResponse(BaseModel):
    id: int
    course_id: int
    score: float
    passed: bool
    started_at: datetime
    completed_at: datetime

    class Config:
        from_attributes = True


class ExamQuestionCreate(BaseModel):
    course_id: int
    question_text: str
    options: List[str]
    correct_answer: int
    difficulty: str = "medium"
    explanation: str = ""
