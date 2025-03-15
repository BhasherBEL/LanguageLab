from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

# Mistral API details
MODEL_NAME = "mistralai/mistral-small-24b-instruct-2501:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Initialize FastAPI router
chatRouter = APIRouter(prefix="/chat", tags=["chat"])

# Message schema
class ChatMessage(BaseModel):
    session_id: str
    role: str
    content: str

# Temporary chat history storage
chat_sessions = {}

@chatRouter.post("/")
async def chat_with_ai(message: ChatMessage):
    session_id = message.session_id
    user_message = {"role": message.role, "content": message.content}

    # Store chat history per session
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []

    chat_sessions[session_id].append(user_message)

    # Prepare request
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL_NAME,
        "messages": chat_sessions[session_id]
    }

    # Call Mistral AI
    response = requests.post(API_URL, headers=headers, json=data)

    if response.status_code == 200:
        bot_response = response.json()["choices"][0]["message"]["content"]
        chat_sessions[session_id].append({"role": "assistant", "content": bot_response})
        return {"response": bot_response}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
