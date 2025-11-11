from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.security import get_current_user, get_current_admin_user
from app.db.session import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.schemas.course import CourseCreate, CourseResponse, CourseDetail

router = APIRouter()


@router.get("/", response_model=List[CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    """List all published courses"""
    courses = db.query(Course).filter(Course.is_published == True).all()
    return courses


@router.get("/{course_id}", response_model=CourseDetail)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get course details"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    return course


@router.get("/slug/{slug}", response_model=CourseDetail)
def get_course_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get course details by slug"""
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    return course


@router.get("/{course_id}/enrolled")
def check_enrollment(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user is enrolled in a course"""
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.payment_status == "completed"
    ).first()

    return {"enrolled": enrollment is not None}


@router.post("/", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new course (admin only)"""
    course = Course(**course_data.dict())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course_data: CourseCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a course (admin only)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    for key, value in course_data.dict().items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)
    return course
