# ─────────────────────────────────────────────────────────
# providers/gemini.py
# Handles all API communication with Google Gemini.
# Model: Gemini 1.5 Pro
# ─────────────────────────────────────────────────────────

import os
import httpx
from backend.config import GEMINI_API_URL


def call(model: str, system_prompt: str, user_message: str) -> str:
    """
    Send a chat completion request to the Gemini API.

    Args:
        model:         Gemini model string (e.g. 'gemini-1.5-pro')
        system_prompt: Instruction prompt defining response structure
        user_message:  The actual content to respond to

    Returns:
        The model's response as a plain string.

    Raises:
        RuntimeError: If the API returns a non-200 status or an unexpected payload.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in the environment.")

    headers = {
        "Content-Type":  "application/json",
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_prompt}\n\n{user_message}"}
                ]
            }
        ]
    }

    url = f"{GEMINI_API_URL}?key={api_key}"

    response = httpx.post(url, json=payload, timeout=60)

    if response.status_code != 200:
        raise RuntimeError(
            f"Gemini API error {response.status_code}: {response.text}"
        )

    data = response.json()

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"Unexpected Gemini response structure: {e}\n{data}")
