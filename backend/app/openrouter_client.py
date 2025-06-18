from openai import AsyncOpenAI
from typing import List, Dict
import config


class OpenRouterClient:
    def __init__(self):
        self.api_key = config.OPENROUTER_API_KEY
        if not self.api_key:
            raise ValueError("OpenRouter API key not configured")

        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "https://languagelab.be",
                "X-Title": "LanguageLab",
            },
        )

    async def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        system_prompt: str | None = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        """
        Send a chat completion request to OpenRouter API using OpenAI SDK

        Args:
            model: The model to use (e.g., "anthropic/claude-3-haiku")
            messages: List of message objects with 'role' and 'content'
            system_prompt: Optional system prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature

        Returns:
            The generated response content
        """
        try:
            formatted_messages = []

            if system_prompt:
                formatted_messages.append({"role": "system", "content": system_prompt})

            formatted_messages.extend(messages)

            response = await self.client.chat.completions.create(
                model=model,
                messages=formatted_messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False,
            )

            if response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content
                if content is None:
                    raise Exception("API returned empty response content")
                return content
            else:
                raise Exception(f"Unexpected response format: no choices returned")

        except Exception as e:
            raise Exception(f"OpenRouter API error: {str(e)}")


openrouter_client = OpenRouterClient()
