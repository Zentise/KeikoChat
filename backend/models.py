"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Literal


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    mode: Literal["chat", "vent", "support"] = Field(default="chat", description="Conversation mode")
    persona: Literal["listener", "friend", "motivator"] = Field(default="listener", description="AI persona")
    session_id: str = Field(default="default", description="Session identifier for memory")


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="AI generated response")
    mode: str = Field(..., description="Mode used for this response")
    persona: str = Field(..., description="Persona used for this response")
