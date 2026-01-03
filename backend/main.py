import os
import logging
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=API_KEY)
# Using gemini-flash-latest as verified working model
model = genai.GenerativeModel("gemini-flash-latest")

app = FastAPI(title="KeikoChat API", description="Backend for AI Supportive Chat")

# --- Schemas ---
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The user's message")

class ChatResponse(BaseModel):
    reply: str

# --- System Prompt ---
SYSTEM_PROMPT = """
You are KeikoChat, a calm, empathetic, and supportive AI companion.
Your goal is to provide a safe space for users to express themselves.

CORE INSTRUCTIONS:
1. Tone: Warm, gentle, non-judgmental, and validating. Use simple, comforting language.
2. Empathy: Acknolwedge emotions. If a user is sad, validate their sadness.
3. Boundaries: You are an AI, not a human, therapist, or doctor.
4. SAFETY CRITICAL: 
   - DO NOT provide medical diagnoses or treatment advice.
   - If a user mentions self-harm, suicide, or severe crisis: Express concern warmly, firmly state you cannot provide the necessary help, and gently encourage them to seek professional support.
   - Do NOT claim to cure anything.

Response Format:
- Keep responses concise and natural (2-4 sentences usually, unless deeper conversation is needed).
- Do not sign off with "Keiko" in every message.
"""

@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "KeikoChat Backend"}

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    """
    Generate a supportive AI response using Google Gemini.
    """
    try:
        # Construct the full prompt context
        # Note: For a real app, we would manage chat history here. 
        # For this statless request, we wrap the single message.
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {request.message}\nKeiko:"
        
        response = model.generate_content(full_prompt)
        
        # Safety check: Ensure the model actually returned text
        if not response.parts:
             raise ValueError("Model returned empty response (potential safety block).")

        return ChatResponse(reply=response.text.strip())

    except ValueError as ve:
        logger.error(f"Gemini generation error: {ve}")
        # Fallback for safety blocks
        return ChatResponse(reply="I want to support you, but I'm having trouble phrasing a response right now. I'm listening if you want to try saying that differently.")
    
    except Exception as e:
        logger.error(f"Internal Server Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable."
        )
