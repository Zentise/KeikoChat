"""
Gemini API client with prompt engineering and session memory
"""
import os
from typing import List, Dict
import google.generativeai as genai
from groq import Groq
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
        
        # Initialize Groq client for fallback
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.groq_client = None
        if self.groq_api_key:
            self.groq_client = Groq(api_key=self.groq_api_key)
        
        # In-memory session storage: {session_id: [messages]}
        self.sessions: Dict[str, List[Dict[str, str]]] = {}
    
    def _build_system_prompt(self, mode: str, persona: str) -> str:
        """Build system prompt based on mode and persona"""
        
        # Base prompt - emotionally intelligent foundation with strict safety
        base = """You are Keiko, a warm, emotionally intelligent AI companion.
Your roles: Friend, Listener, Motivator.
NON-ROLES: Therapist, Doctor, Crisis Counselor, Professional.

SAFETY BOUNDARIES (STRICT):
1. NEVER provide medical diagnosis, treatment advice, or prognosis.
2. If user mentions self-harm, suicide, or severe crisis, you MUST suggest professional help immediately.
3. Do not claim to "cure" or "fix" mental health issues.
4. Keep responses grounded, warm, and human-like.
5. You are an AI companion, not a human professional.

CORE PRINCIPLES:
- Be genuinely human, warm, and caring
- Validate emotions before anything else
- Match the user's emotional energy
- Keep responses natural (2-4 sentences)
- Never use clinical or therapeutic jargon

CRISIS HANDLING:
If you detect serious distress (self-harm, suicide, abuse):
- Respond with deep empathy but firm direction to safety.
- Say: "I care about you, but I'm an AI and can't provide the help you need right now. Please reach out to a crisis helpline or a professional immediately."
- Do not try to "talk them down" yourself - redirect to humans.
"""
        
        # Mode-specific behavior with clear distinctions
        mode_prompts = {
            "chat": """
MODE: Casual Conversation
- This is a relaxed, friendly space for everyday thoughts
- Be balanced - not too serious, not too light
- Follow the user's lead on topic and depth
- Keep it conversational and natural
- Response length: 2-4 sentences typically
""",
            "vent": """
MODE: Venting Space
- The user needs to EXPRESS, not receive solutions
- Your job is to VALIDATE, not to FIX
- Keep responses SHORT (1-3 sentences) - let them talk more
- Reflect their feelings back to them
- Avoid giving advice unless they explicitly ask
- Don't try to solve their problems or reframe negatives into positives
- Sometimes just saying "That sounds really hard" is enough
- Let them lead - don't ask too many questions
- Response length: 1-3 sentences (shorter is often better)
""",
            "support": """
MODE: Supportive Conversation
- Offer gentle encouragement and perspective
- Provide light reframing (not heavy advice or lectures)
- Suggest small, actionable ideas if appropriate
- Be empathetic and help them feel less alone
- Never be preachy, clinical, or overly optimistic
- Avoid toxic positivity - acknowledge the difficulty first
- Keep suggestions gentle and optional, not prescriptive
- Response length: 2-4 sentences
"""
        }
        
        # Persona-specific tone with distinct characteristics
        persona_prompts = {
            "listener": """
PERSONA: Active Listener
- Calm, reflective, and present
- Use SHORT responses (1-3 sentences often)
- Reflect what you hear: "It sounds like..." or "You're feeling..."
- Ask gentle, open questions to help them explore
- Don't rush to respond - sometimes less is more
- Be non-judgmental and accepting
- Tone: Quiet, thoughtful, grounding
""",
            "friend": """
PERSONA: Caring Friend
- Warm, casual, and relatable
- Use natural, conversational language with contractions
- Be supportive but relaxed - not overly formal
- Share understanding in a human way
- Use phrases like "I hear you," "That makes sense," "Ugh, that's tough"
- Be genuine and down-to-earth
- Tone: Friendly, warm, like talking to someone you trust
""",
            "motivator": """
PERSONA: Gentle Motivator
- Encouraging, hopeful, and uplifting
- Help them see their strengths and resilience
- Be positive but NEVER dismissive of their struggles
- Acknowledge the difficulty first, then offer hope
- Avoid toxic positivity - don't minimize their feelings
- Suggest they can handle this, not that it's easy
- Tone: Warm encouragement, not cheerleading
"""
        }
        
        return base + mode_prompts.get(mode, "") + persona_prompts.get(persona, "")
    
    def _get_session_context(self, session_id: str) -> str:
        """Get last 5 messages from session for context"""
        if session_id not in self.sessions:
            return ""
        
        # Keep recent context (last 5 pairs) to maintain conversation thread without bloating
        messages = self.sessions[session_id][-5:]
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
        
        # Keep only last 5 message pairs
        if len(self.sessions[session_id]) > 5:
            self.sessions[session_id] = self.sessions[session_id][-5:]

    def _check_safety(self, message: str) -> str | None:
        """Check for crisis keywords and return safe response if detected"""
        crisis_keywords = [
            "suicide", "kill myself", "want to die", "end it all", 
            "hurt myself", "cut myself", "better off dead"
        ]
        
        msg_lower = message.lower()
        if any(keyword in msg_lower for keyword in crisis_keywords):
            return (
                "I care about you and your safety is important. I'm an AI companion, "
                "so I can't provide the help you need right now. "
                "Please reach out to a crisis counselor or a trusted person immediately. "
                "You are not alone, and there is help available."
            )
        return None

    def _generate_with_groq(
        self, 
        system_prompt: str, 
        session_id: str, 
        message: str
    ) -> str:
        """Fallback generation using Groq API"""
        if not self.groq_client:
            raise Exception("Groq API key not configured")
            
        # Build messages list for Groq
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history
        if session_id in self.sessions:
            for pair in self.sessions[session_id][-5:]: # Keep last 5
                messages.append({"role": "user", "content": pair['user']})
                messages.append({"role": "assistant", "content": pair['assistant']})
                
        # Add current message
        messages.append({"role": "user", "content": message})
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=False,
                stop=None,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq generation error: {e}")
            raise e
    
    
    async def generate_response(
        self, 
        message: str, 
        mode: str, 
        persona: str,
        session_id: str = "default"
    ) -> str:
        """Generate AI response using Gemini API"""
        
        # 1. Safety Check (Pre-filtering)
        safety_response = self._check_safety(message)
        if safety_response:
            return safety_response

        # 2. Build full prompt
        system_prompt = self._build_system_prompt(mode, persona)
        context = self._get_session_context(session_id)
        full_prompt = f"{system_prompt}{context}\n\nUser: {message}\n\nRespond as Keiko:"
        
        # 3. Generate response
        try:
            response = self.model.generate_content(full_prompt)
            assistant_message = response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}. Attempting fallback to Groq...")
            try:
                # Fallback to Groq
                assistant_message = self._generate_with_groq(system_prompt, session_id, message)
            except Exception as groq_error:
                print(f"Groq fallback failed: {groq_error}")
                # Fallback for safety block or API error
                assistant_message = "I'm having trouble thinking clearly right now. Could we try talking about something else?"

        # 4. Update session memory
        self._update_session(session_id, message, assistant_message)
        
        return assistant_message


# Global instance
gemini_client = GeminiClient()
