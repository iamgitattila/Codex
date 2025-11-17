from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from api import auth, campaigns, generation, credits, billing, stripe_webhooks

app = FastAPI(
    title="BannersLanders AI API",
    description="AI-powered ad generation for affiliate marketers",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://bannerslanders.com",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["campaigns"])
app.include_router(generation.router, prefix="/api", tags=["generation"])
app.include_router(credits.router, prefix="/api", tags=["credits"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])
app.include_router(stripe_webhooks.router, prefix="/api/webhooks", tags=["webhooks"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "BannersLanders AI API",
        "version": "1.0.0",
        "status": "online"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
