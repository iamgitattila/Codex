from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime
import qrcode
from app.core.config import settings


def generate_certificate_pdf(certificate, db):
    """Generate a PDF certificate"""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Draw border
    c.setStrokeColor(colors.HexColor('#1e40af'))
    c.setLineWidth(3)
    c.rect(30, 30, width - 60, height - 60)

    c.setStrokeColor(colors.HexColor('#3b82f6'))
    c.setLineWidth(1)
    c.rect(40, 40, width - 80, height - 80)

    # Title
    c.setFont("Helvetica-Bold", 40)
    c.setFillColor(colors.HexColor('#1e40af'))
    c.drawCentredString(width / 2, height - 120, "CERTIFICATE")

    c.setFont("Helvetica", 20)
    c.drawCentredString(width / 2, height - 150, "of Achievement")

    # Horizontal line
    c.setStrokeColor(colors.HexColor('#3b82f6'))
    c.setLineWidth(2)
    c.line(150, height - 170, width - 150, height - 170)

    # Presented to
    c.setFont("Helvetica", 16)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 220, "This certificate is proudly presented to")

    # Student name
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(colors.HexColor('#1e40af'))
    c.drawCentredString(width / 2, height - 270, certificate.user.full_name)

    # Achievement text
    c.setFont("Helvetica", 16)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 320, "for successfully completing the")

    # Course name
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(colors.HexColor('#1e40af'))
    c.drawCentredString(width / 2, height - 360, certificate.course.title)

    # Score
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 400, f"with a score of {certificate.exam_score}%")

    # Date
    c.setFont("Helvetica", 12)
    date_str = certificate.issued_at.strftime("%B %d, %Y")
    c.drawCentredString(width / 2, height - 450, f"Issued on {date_str}")

    # Certificate number
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor('#6b7280'))
    c.drawCentredString(width / 2, 100, f"Certificate No: {certificate.certificate_number}")
    c.drawCentredString(width / 2, 85, f"Verification Code: {certificate.verification_code}")

    # Generate QR code for verification
    qr_data = f"{settings.FRONTEND_URL}/verify/{certificate.verification_code}"
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")

    # Save QR code to buffer
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)

    # Draw QR code
    c.drawImage(qr_buffer, width - 120, 50, width=70, height=70, mask='auto')

    # Footer text
    c.setFont("Helvetica", 8)
    c.drawString(50, 70, "Scan QR code to verify")

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer
