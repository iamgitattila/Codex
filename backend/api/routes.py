"""
FastAPI Routes for Ad Replication Engine
"""
import os
import uuid
import tempfile
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ..engine import AdPipelineOrchestrator, LearningSystem

app = FastAPI(
    title="Ad Replication Engine API",
    description="Transform winning ads into 1000+ variations across verticals",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
config = {
    'anthropic_api_key': os.getenv('ANTHROPIC_API_KEY', '')
}
orchestrator = AdPipelineOrchestrator(config)
learning_system = LearningSystem(
    db_path=os.getenv('DB_PATH', 'ad_learning.db'),
    api_key=config['anthropic_api_key']
)

# Store for async job results
job_results = {}


# Request/Response Models
class AnalyzeRequest(BaseModel):
    context: Optional[str] = ""


class GenerateRequest(BaseModel):
    target_product: str
    target_industry: str
    target_audience: str
    num_variations: int = 20


class FullPipelineRequest(BaseModel):
    target_product: str
    target_industry: str
    target_audience: str
    num_variations: int = 20


class PerformanceLogRequest(BaseModel):
    variation_id: str
    generation_id: str
    impressions: int
    clicks: int
    conversions: int
    spend: float
    revenue: float
    user_rating: Optional[int] = None


class JobStatus(BaseModel):
    job_id: str
    status: str  # "pending", "processing", "completed", "failed"
    result: Optional[dict] = None
    error: Optional[str] = None


@app.get("/")
async def root():
    return {
        "name": "Ad Replication Engine API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/api/analyze",
            "generate": "/api/generate",
            "pipeline": "/api/pipeline",
            "insights": "/api/insights",
            "performance": "/api/performance"
        }
    }


@app.post("/api/analyze")
async def analyze_ads(
    files: List[UploadFile] = File(...),
    context: str = Form("")
):
    """
    Analyze uploaded ad images to extract winning principles.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # Save uploaded files temporarily
    temp_paths = []
    try:
        for file in files:
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                content = await file.read()
                tmp.write(content)
                temp_paths.append(tmp.name)

        # Run analysis
        results = await orchestrator.analyze_only(temp_paths)

        return {
            "success": True,
            "analysis": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Cleanup temp files
        for path in temp_paths:
            if os.path.exists(path):
                os.unlink(path)


@app.post("/api/generate")
async def generate_variations(
    request: GenerateRequest,
    universal_principles: dict
):
    """
    Generate ad variations using pre-existing universal principles.
    """
    try:
        results = await orchestrator.generate_from_principles(
            universal_guide=universal_principles,
            target_product=request.target_product,
            target_industry=request.target_industry,
            target_audience=request.target_audience,
            num_variations=request.num_variations
        )

        return {
            "success": True,
            "variations": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def run_pipeline_job(
    job_id: str,
    temp_paths: list,
    target_product: str,
    target_industry: str,
    target_audience: str,
    num_variations: int
):
    """Background task to run the full pipeline."""
    try:
        job_results[job_id] = {"status": "processing"}

        results = await orchestrator.process_ads(
            file_paths=temp_paths,
            target_product=target_product,
            target_industry=target_industry,
            target_audience=target_audience,
            num_variations=num_variations
        )

        # Log to learning system
        generation_id = str(uuid.uuid4())
        await learning_system.log_generation(generation_id, results['metadata'])

        # Log variations
        for var in results.get('generated_variations', {}).get('variations', []):
            var_id = var.get('variation_id', str(uuid.uuid4()))
            await learning_system.log_variation(var_id, generation_id, var)

        results['generation_id'] = generation_id
        job_results[job_id] = {
            "status": "completed",
            "result": results
        }

    except Exception as e:
        job_results[job_id] = {
            "status": "failed",
            "error": str(e)
        }

    finally:
        # Cleanup temp files
        for path in temp_paths:
            if os.path.exists(path):
                os.unlink(path)


@app.post("/api/pipeline")
async def run_full_pipeline(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    target_product: str = Form(...),
    target_industry: str = Form(...),
    target_audience: str = Form(...),
    num_variations: int = Form(20)
):
    """
    Run the full pipeline: Analyze → Abstract → Generate → Review
    Returns a job ID for async processing.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # Save uploaded files temporarily
    temp_paths = []
    for file in files:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_paths.append(tmp.name)

    # Create job
    job_id = str(uuid.uuid4())
    job_results[job_id] = {"status": "pending"}

    # Run in background
    background_tasks.add_task(
        run_pipeline_job,
        job_id,
        temp_paths,
        target_product,
        target_industry,
        target_audience,
        num_variations
    )

    return {
        "success": True,
        "job_id": job_id,
        "message": "Pipeline started. Check /api/job/{job_id} for status."
    }


@app.get("/api/job/{job_id}")
async def get_job_status(job_id: str):
    """Get the status of an async job."""
    if job_id not in job_results:
        raise HTTPException(status_code=404, detail="Job not found")

    return job_results[job_id]


@app.post("/api/performance")
async def log_performance(request: PerformanceLogRequest):
    """Log performance data for a variation."""
    try:
        await learning_system.log_variation_performance(
            variation_id=request.variation_id,
            generation_id=request.generation_id,
            impressions=request.impressions,
            clicks=request.clicks,
            conversions=request.conversions,
            spend=request.spend,
            revenue=request.revenue,
            user_rating=request.user_rating
        )

        return {"success": True, "message": "Performance logged"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/insights")
async def get_insights():
    """Get performance insights and recommendations."""
    try:
        insights = await learning_system.get_insights()
        return {
            "success": True,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/best-framework/{industry}")
async def get_best_framework(industry: str):
    """Get the best performing framework for an industry."""
    try:
        framework = await learning_system.get_best_framework_for_industry(industry)
        return {
            "success": True,
            "industry": industry,
            "recommended_framework": framework
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
