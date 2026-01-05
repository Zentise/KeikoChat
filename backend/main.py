"""
KeikoChat Stage 1 - FastAPI Backend
Text-only AI chatbot with Gemini integration
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ChatRequest, ChatResponse
from gemini_client import gemini_client

# Initialize FastAPI app
app = FastAPI(
    title="KeikoChat API",
    description="Stage 1 - Text-only AI chatbot backend",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "KeikoChat API",
        "stage": "1 - Text Only",
        "version": "1.0.0"
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint
    
    Accepts user message, mode, and persona
    Returns AI-generated response using Gemini API
    """
    try:
        # Generate response using Gemini
        ai_response = await gemini_client.generate_response(
            message=request.message,
            mode=request.mode,
            persona=request.persona,
            session_id=request.session_id
        )
        
        return ChatResponse(
            response=ai_response,
            mode=request.mode,
            persona=request.persona
        )
    
    except Exception as e:
        # Log error and return user-friendly message
        print(f"Error generating response: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Sorry, I'm having trouble responding right now. Please try again."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
