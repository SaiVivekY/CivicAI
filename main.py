"""
CivicAI - FastAPI Backend Server
Provides REST API endpoints for civic and legal rights guidance powered by Groq.
"""

import os
from typing import List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from grok_client import generate_civic_guidance, GroqClientError

# Load environment variables
load_dotenv()

# Initialize FastAPI Application
app = FastAPI(
    title="CivicAI Backend API",
    description="AI-powered civic and legal rights assistant for Indian citizens powered by Groq",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ------------------------------------------------------------------------------
# CORS Configuration
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Pydantic Request & Response Models
# ------------------------------------------------------------------------------
class GuidanceRequest(BaseModel):
    problem: str = Field(
        ...,
        min_length=3,
        max_length=4000,
        description="The citizen's description of their civic or legal issue in plain language.",
        examples=["My landlord has not returned my security deposit of ₹45,000 even after vacating 2 months ago."]
    )


class GuidanceResponse(BaseModel):
    situation: str = Field(
        ...,
        description="Clear plain-language explanation of the citizen's situation under Indian civic/legal context."
    )
    category: str = Field(
        ...,
        description="Identified civic or legal domain."
    )
    what_you_can_do: List[str] = Field(
        ...,
        description="Step-by-step practical next steps for resolving the issue."
    )
    documents_needed: List[str] = Field(
        ...,
        description="List of essential documents or evidence required."
    )
    sources: List[str] = Field(
        default_factory=list,
        description="Publicly available reference sources or official portals."
    )
    disclaimer: str = Field(
        default="This is general informational guidance and is not a substitute for professional legal advice.",
        description="Statutory informational disclaimer."
    )


# ------------------------------------------------------------------------------
# Health Check & Root Endpoints
# ------------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "CivicAI Backend API (Groq)",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    api_key_configured = bool(
        os.getenv("GROQ_API_KEY") and os.getenv("GROQ_API_KEY") != "YOUR_GROQ_API_KEY"
    )
    return {
        "status": "healthy",
        "provider": "Groq",
        "groq_api_key_set": api_key_configured,
        "model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    }


# ------------------------------------------------------------------------------
# Guidance Endpoint: POST /api/guidance
# ------------------------------------------------------------------------------
@app.post(
    "/api/guidance",
    response_model=GuidanceResponse,
    status_code=status.HTTP_200_OK,
    tags=["Guidance"],
    summary="Get Groq-powered civic & legal guidance for a citizen's problem"
)
async def get_guidance(request: GuidanceRequest):
    """
    Processes a citizen's plain-language problem description using Groq API
    and returns structured, actionable legal/civic guidance.
    """
    problem_text = request.problem.strip()
    if not problem_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Problem description cannot be empty."
        )

    try:
        guidance_data = generate_civic_guidance(problem_text)
        return GuidanceResponse(**guidance_data)

    except GroqClientError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred: {str(err)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
