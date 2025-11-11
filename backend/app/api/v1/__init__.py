from fastapi import APIRouter

from app.api.v1.endpoints import auth, courses, exams, certificates, payments

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
