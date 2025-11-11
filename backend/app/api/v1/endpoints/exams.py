from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.security import get_current_user, get_current_admin_user
from app.db.session import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.exam_question import ExamQuestion
from app.models.exam_attempt import ExamAttempt
from app.models.certificate import Certificate
from app.schemas.exam import (
    ExamQuestionResponse,
    ExamSubmission,
    ExamAttemptResponse,
    ExamQuestionCreate
)

router = APIRouter()


@router.get("/{course_id}/questions", response_model=List[ExamQuestionResponse])
def get_exam_questions(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get exam questions for a course (only if enrolled)"""
    # Check enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.payment_status == "completed"
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled to access this exam"
        )

    # Get questions (without correct answers)
    questions = db.query(ExamQuestion).filter(
        ExamQuestion.course_id == course_id
    ).all()

    return questions


@router.post("/{course_id}/submit", response_model=ExamAttemptResponse)
def submit_exam(
    course_id: int,
    submission: ExamSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit exam answers and get results"""
    # Check enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.payment_status == "completed"
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled to submit this exam"
        )

    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Get all questions
    questions = db.query(ExamQuestion).filter(
        ExamQuestion.course_id == course_id
    ).all()

    # Calculate score
    correct_answers = 0
    for question in questions:
        user_answer = submission.answers.get(question.id)
        if user_answer == question.correct_answer:
            correct_answers += 1

    score = (correct_answers / len(questions)) * 100 if questions else 0
    passed = score >= course.pass_percentage

    # Create exam attempt
    exam_attempt = ExamAttempt(
        user_id=current_user.id,
        course_id=course_id,
        score=score,
        passed=passed,
        completed_at=datetime.utcnow(),
        answers=submission.answers
    )
    db.add(exam_attempt)

    # If passed, mark enrollment as completed and create certificate
    if passed:
        enrollment.completed_at = datetime.utcnow()

        # Check if certificate already exists
        existing_cert = db.query(Certificate).filter(
            Certificate.user_id == current_user.id,
            Certificate.course_id == course_id
        ).first()

        if not existing_cert:
            certificate = Certificate(
                user_id=current_user.id,
                course_id=course_id,
                exam_score=int(score)
            )
            db.add(certificate)

    db.commit()
    db.refresh(exam_attempt)

    return exam_attempt


@router.get("/{course_id}/attempts", response_model=List[ExamAttemptResponse])
def get_exam_attempts(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's exam attempts for a course"""
    attempts = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == current_user.id,
        ExamAttempt.course_id == course_id
    ).order_by(ExamAttempt.completed_at.desc()).all()

    return attempts


@router.post("/questions", response_model=ExamQuestionResponse)
def create_question(
    question_data: ExamQuestionCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create an exam question (admin only)"""
    question = ExamQuestion(**question_data.dict())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question
