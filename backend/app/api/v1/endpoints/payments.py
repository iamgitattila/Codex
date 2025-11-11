from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import stripe

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-checkout-session")
def create_checkout_session(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe checkout session for course purchase"""
    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check if already enrolled
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.payment_status == "completed"
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )

    # Create or get pending enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.payment_status == "pending"
    ).first()

    if not enrollment:
        enrollment = Enrollment(
            user_id=current_user.id,
            course_id=course_id,
            payment_status="pending"
        )
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)

    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': int(course.price * 100),  # Convert to cents
                    'product_data': {
                        'name': course.title,
                        'description': course.short_description or course.description[:100],
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{settings.FRONTEND_URL}/courses/{course.slug}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/courses/{course.slug}",
            client_reference_id=str(enrollment.id),
            customer_email=current_user.email,
            metadata={
                'enrollment_id': enrollment.id,
                'user_id': current_user.id,
                'course_id': course_id
            }
        )

        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating checkout session: {str(e)}"
        )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        # Get enrollment from metadata
        enrollment_id = session['metadata']['enrollment_id']
        enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

        if enrollment:
            enrollment.payment_status = "completed"
            enrollment.stripe_payment_id = session['id']
            enrollment.amount_paid = session['amount_total']
            db.commit()

    return {"status": "success"}


@router.get("/check-session/{session_id}")
def check_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check the status of a Stripe checkout session"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == "paid":
            enrollment_id = int(session.client_reference_id)
            enrollment = db.query(Enrollment).filter(
                Enrollment.id == enrollment_id,
                Enrollment.user_id == current_user.id
            ).first()

            if enrollment and enrollment.payment_status != "completed":
                enrollment.payment_status = "completed"
                enrollment.stripe_payment_id = session.id
                enrollment.amount_paid = session.amount_total
                db.commit()

            return {"status": "completed", "enrollment_id": enrollment_id}

        return {"status": session.payment_status}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking session: {str(e)}"
        )
