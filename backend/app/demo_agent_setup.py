#!/usr/bin/env python3
"""
Demo script to create an agent user and test OpenRouter integration

This script demonstrates how to:
1. Create an agent user with a specific model and system prompt
2. Create a session with both human and agent users
3. Send a message from the human to trigger an agent response

Prerequisites:
- Set OPENROUTER_API_KEY environment variable
- Run the backend server
- Have openai package installed (added to requirements.txt)

Usage:
python demo_agent_setup.py
"""

import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000/tmp-api/v1"
ADMIN_EMAIL = "admin@admin.tld"
ADMIN_PASSWORD = "admin"


def login_as_admin() -> str:
    """Login as admin and return access token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )

    if response.status_code != 200:
        raise Exception(f"Login failed: {response.status_code} - {response.text}")

    # Extract token from cookies
    cookies = response.cookies
    token = cookies.get("access_token")
    if not token:
        raise Exception("No access token received from login response")
    return token


def create_agent_user(token: str, nickname: str, model: str, system_prompt: str) -> int:
    """Create an agent user"""
    headers = {"Cookie": f"access_token={token}"}

    agent_data = {
        "nickname": nickname,
        "is_active": True,
        "agent_user": {
            "model": model,
            "system_prompt": system_prompt,
            "is_in_pool": True,
        },
    }

    response = requests.post(f"{BASE_URL}/users", json=agent_data, headers=headers)

    if response.status_code != 201:
        raise Exception(
            f"Agent creation failed: {response.status_code} - {response.text}"
        )

    return response.json()


def create_human_user(token: str, nickname: str, email: str, password: str) -> int:
    """Create a human user"""
    headers = {"Cookie": f"access_token={token}"}

    human_data = {
        "nickname": nickname,
        "is_active": True,
        "human_user": {
            "email": email,
            "password": password,
            "type": 2,  # STUDENT
            "bio": "Test human user",
            "ui_language": "en",
            "home_language": "en",
            "target_language": "fr",
        },
    }

    response = requests.post(f"{BASE_URL}/users", json=human_data, headers=headers)

    if response.status_code != 201:
        raise Exception(
            f"Human user creation failed: {response.status_code} - {response.text}"
        )

    return response.json()


def create_session_with_users(
    token: str, human_user_id: int, agent_user_id: int
) -> int:
    """Create a session and add both users"""
    headers = {"Cookie": f"access_token={token}"}

    # Create session
    response = requests.post(f"{BASE_URL}/sessions", headers=headers)

    if response.status_code != 200:
        raise Exception(
            f"Session creation failed: {response.status_code} - {response.text}"
        )

    session = response.json()
    session_id = session["id"]

    # Add agent user to session
    response = requests.post(
        f"{BASE_URL}/sessions/{session_id}/users/{agent_user_id}", headers=headers
    )

    if response.status_code != 201:
        raise Exception(
            f"Adding agent to session failed: {response.status_code} - {response.text}"
        )

    print(
        f"Created session {session_id} with human user {human_user_id} and agent user {agent_user_id}"
    )
    return session_id


def send_message(token: str, session_id: int, content: str) -> Dict[str, Any]:
    """Send a message to trigger agent response"""
    headers = {"Cookie": f"access_token={token}"}

    message_data = {"content": content, "metadata": []}

    response = requests.post(
        f"{BASE_URL}/sessions/{session_id}/messages", json=message_data, headers=headers
    )

    if response.status_code != 201:
        raise Exception(
            f"Message sending failed: {response.status_code} - {response.text}"
        )

    return response.json()


def main():
    print("🤖 LanguageLab Agent Demo")
    print("=" * 50)

    try:
        # Step 1: Login as admin
        print("1. Logging in as admin...")
        token = login_as_admin()
        print("   ✅ Admin login successful")

        # Step 2: Create an agent user
        print("2. Creating agent user...")
        agent_id = create_agent_user(
            token=token,
            nickname="French Tutor Bot",
            model="anthropic/claude-3-haiku",  # You can change this to any OpenRouter model
            system_prompt="You are a helpful French language tutor. You help students learn French by having conversations, correcting mistakes, and providing explanations. Always respond in a friendly and encouraging manner.",
        )
        print(f"   ✅ Agent user created with ID: {agent_id}")

        # Step 3: Create a human user (optional - you can use existing users)
        print("3. Creating human user...")
        try:
            human_id = create_human_user(
                token=token,
                nickname="Test Student",
                email="student@test.com",
                password="password123",
            )
            print(f"   ✅ Human user created with ID: {human_id}")
        except Exception as e:
            if "already registered" in str(e):
                print(
                    "   ℹ️  Test user already exists, you can use an existing human user"
                )
                human_id = 1  # Assuming admin has ID 1
            else:
                raise e

        # Step 4: Create session with both users
        print("4. Creating session...")
        session_id = create_session_with_users(token, human_id, agent_id)
        print(f"   ✅ Session created with ID: {session_id}")

        # Step 5: Send a test message
        print("5. Sending test message...")
        message_result = send_message(
            token=token,
            session_id=session_id,
            content="Bonjour! Comment allez-vous? I'm learning French and would like to practice.",
        )
        print(f"   ✅ Message sent with ID: {message_result['message_id']}")

        print("\n🎉 Demo completed successfully!")
        print(f"📱 You can now check session {session_id} for the agent's response")
        print(f"🔗 API endpoint: {BASE_URL}/sessions/{session_id}/messages")

        print("\n📋 Summary:")
        print(f"   - Agent User ID: {agent_id}")
        print(f"   - Human User ID: {human_id}")
        print(f"   - Session ID: {session_id}")
        print(f"   - Message ID: {message_result['message_id']}")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("   - Make sure the backend server is running")
        print("   - Set OPENROUTER_API_KEY environment variable")
        print("   - Check that admin credentials are correct")


if __name__ == "__main__":
    main()
