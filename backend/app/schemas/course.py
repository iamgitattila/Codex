from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CourseCreate(BaseModel):
    title: str
    slug: str
    description: str
    short_description: Optional[str] = None
    price: float
    level: str
    duration: str
    pass_percentage: int = 70
    exam_duration: int = 60
    syllabus: Optional[str] = None
    learning_outcomes: Optional[str] = None


class CourseResponse(BaseModel):
    id: int
    title: str
    slug: str
    short_description: Optional[str]
    price: float
    level: str
    duration: str
    is_published: bool

    class Config:
        from_attributes = True


class CourseDetail(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    short_description: Optional[str]
    price: float
    level: str
    duration: str
    pass_percentage: int
    exam_duration: int
    syllabus: Optional[str]
    learning_outcomes: Optional[str]
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True
