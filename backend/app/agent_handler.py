from typing import List
from sqlalchemy.orm import Session
import secrets

import models
import schemas
import crud
from openrouter_client import openrouter_client


async def handle_agent_response(
    db: Session,
    session_id: int,
    human_message: schemas.Message,
    agent_user: models.User,
    background_tasks,
) -> None:
    """
    Handle generating and sending an agent response to a human message

    Args:
        db: Database session
        session_id: ID of the session
        human_message: The message from the human user
        agent_user: The agent user that should respond
        background_tasks: FastAPI background tasks for websocket notifications
    """
    try:
        # Get recent conversation history (last 20 messages)
        recent_messages = crud.get_messages(db, session_id, skip=0)
        recent_messages = (
            recent_messages[-20:] if len(recent_messages) > 20 else recent_messages
        )

        # Format conversation as a single prompt with system prompt first, then dialogue
        conversation_text = agent_user.agent_user.system_prompt + "\n\n"

        for msg in recent_messages:
            # Get the user who sent this message
            msg_user = crud.get_user(db, msg.user_id)
            if msg_user:
                if msg_user.agent_user:
                    # Agent message
                    conversation_text += f"AI: {msg.content}\n"
                else:
                    # Human message - use their nickname
                    conversation_text += f"{msg_user.nickname}: {msg.content}\n"

        # Add "AI:" prefix to prompt for the next response
        conversation_text += "AI:"

        # Generate response using OpenRouter without system prompt
        response_content = await openrouter_client.chat_completion(
            model=agent_user.agent_user.model,
            messages=[{"role": "user", "content": conversation_text}],
            system_prompt=None,
            max_tokens=1000,
            temperature=0.7,
        )

        # Create the agent's response message
        agent_message = schemas.MessageCreate(
            message_id=secrets.token_urlsafe(24),
            content=response_content,
            reply_to_message_id=human_message.message_id,
            metadata=[],
        )

        # Get the session
        db_session = crud.get_session(db, session_id)
        if db_session:
            # Create the message in the database
            created_message = crud.create_message(
                db, agent_message, agent_user, db_session
            )

            # Import the websocket function from main.py
            from main import send_websoket_message

            # Send websocket notification
            background_tasks.add_task(
                send_websoket_message,
                session_id,
                schemas.Message.model_validate(created_message),
                "create",
            )

    except Exception as e:
        print(f"Error generating agent response: {e}")
        # Optionally, create an error message or log the error
        pass


def should_trigger_agent_response(
    db: Session, session: models.Session, current_user: models.User
) -> List[models.User]:
    """
    Determine if an agent response should be triggered and which agents should respond

    Args:
        db: Database session
        session: The session where the message was sent
        current_user: The user who sent the message

    Returns:
        List of agent users that should respond
    """
    # Only trigger if the current user is a human (not an agent)
    if current_user.agent_user:
        return []

    # Find all agent users in the session
    agent_users = []
    for user in session.users:
        if user.agent_user and user.is_active:
            agent_users.append(user)

    return agent_users
