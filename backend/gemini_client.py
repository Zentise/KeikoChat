"""
Gemini API client with prompt engineering and session memory
"""
import os
from typing import List, Dict
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class GeminiClient:
    """Client for interacting with Gemini API"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # In-memory session storage: {session_id: [messages]}
        self.sessions: Dict[str, List[Dict[str, str]]] = {}
    
    def _build_system_prompt(self, mode: str, persona: str) -> str:
        """Build system prompt based on mode and persona"""
        
        # Base prompt - warm, supportive, human
        base = """You are Keiko, a warm, supportive, and emotionally intelligent AI companion.

Your purpose is to provide a safe, judgment-free space for people to express themselves.

IMPORTANT GUIDELINES:
- Be human, warm, and genuinely caring
- Listen actively and validate emotions
- Never diagnose, prescribe, or provide medical advice
- You are NOT a therapist - you're a supportive friend
- If someone is in crisis, gently suggest professional help
- Keep responses conversational and natural (2-4 sentences usually)
- Match the user's emotional tone appropriately

SAFETY DISCLAIMER:
If you sense serious distress, gently remind: "I'm here to listen and support, but if you're experiencing a crisis, please reach out to a mental health professional or crisis helpline."
"""
        
        # Mode-specific behavior
        mode_prompts = {
            "chat": "\nMODE: Casual Chat - Be friendly, light, and conversational. This is a relaxed space for everyday thoughts.",
            "vent": "\nMODE: Venting Space - Let them express freely. Validate their feelings without trying to 'fix' everything. Sometimes people just need to be heard.",
            "support": "\nMODE: Supportive Conversation - Offer gentle encouragement and perspective. Be empathetic and help them feel less alone."
        }
        
        # Persona-specific tone
        persona_prompts = {
            "listener": "\nPERSONA: Active Listener - Focus on understanding and reflecting. Ask gentle questions. Make them feel truly heard.",
            "friend": "\nPERSONA: Caring Friend - Be warm and relatable. Share understanding. Use a friendly, conversational tone.",
            "motivator": "\nPERSONA: Gentle Motivator - Encourage and uplift. Help them see their strengths. Be positive but not dismissive of struggles."
        }
        
        return base + mode_prompts.get(mode, "") + persona_prompts.get(persona, "")
    
    def _get_session_context(self, session_id: str) -> str:
        """Get last 3 messages from session for context"""
        if session_id not in self.sessions:
            return ""
        
        messages = self.sessions[session_id][-3:]  # Last 3 messages only
        if not messages:
            return ""
        
        context = "\n\nRECENT CONVERSATION CONTEXT:\n"
        for msg in messages:
            context += f"User: {msg['user']}\nYou: {msg['assistant']}\n"
        
        return context
    
    def _update_session(self, session_id: str, user_msg: str, assistant_msg: str):
        """Update session memory with new message pair"""
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        
        self.sessions[session_id].append({
            "user": user_msg,
            "assistant": assistant_msg
        })
        
        # Keep only last 3 message pairs
        if len(self.sessions[session_id]) > 3:
            self.sessions[session_id] = self.sessions[session_id][-3:]
    
    async def generate_response(
        self, 
        message: str, 
        mode: str, 
        persona: str,
        session_id: str = "default"
    ) -> str:
        """Generate AI response using Gemini API"""
        
        # Build full prompt
        system_prompt = self._build_system_prompt(mode, persona)
        context = self._get_session_context(session_id)
        full_prompt = f"{system_prompt}{context}\n\nUser: {message}\n\nRespond as Keiko:"
        
        # Generate response
        response = self.model.generate_content(full_prompt)
        assistant_message = response.text.strip()
        
        # Update session memory
        self._update_session(session_id, message, assistant_message)
        
        return assistant_message


# Global instance
gemini_client = GeminiClient()
