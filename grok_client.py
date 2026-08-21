"""
CivicAI - Groq API Client
Handles communication with the GroqCloud API using the official Groq Python SDK,
payload formatting, and safe JSON output parsing.
"""

import os
import json
import re
from typing import Dict, Any, List
from dotenv import load_dotenv
from groq import Groq
from prompts import CIVICAI_SYSTEM_PROMPT, build_user_prompt

# Load environment variables from .env file
load_dotenv()

DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant"


class GroqClientError(Exception):
    """Custom exception class for Groq API related failures."""
    pass


def get_groq_client() -> Groq:
    """
    Initializes and returns the Groq client using GROQ_API_KEY.
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key or api_key == "YOUR_GROQ_API_KEY":
        raise GroqClientError(
            "GROQ_API_KEY is not configured. Please set your Groq API key in backend/.env file."
        )
    return Groq(api_key=api_key)


def clean_json_string(raw_text: str) -> str:
    """
    Strips markdown code blocks (```json ... ```) or trailing text to extract clean JSON.
    """
    text = raw_text.strip()
    # Match markdown code block ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return text


def sanitize_groq_response(parsed: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures all expected keys (situation, category, what_you_can_do, documents_needed, sources, disclaimer)
    are present with appropriate types, handling malformed outputs safely.
    """
    situation = str(parsed.get("situation", "Informational guidance based on your query.")).strip()
    category = str(parsed.get("category", "General Civic Rights")).strip()

    # Normalize what_you_can_do (supports legacy action_plan key if AI slips)
    raw_actions = parsed.get("what_you_can_do", parsed.get("action_plan", []))
    if isinstance(raw_actions, list):
        what_you_can_do = [str(step).strip() for step in raw_actions if step]
    elif isinstance(raw_actions, str):
        what_you_can_do = [raw_actions.strip()]
    else:
        what_you_can_do = ["Document your situation and approach the concerned authority."]

    if not what_you_can_do:
        what_you_can_do = ["Check your application status with the concerned department."]

    # Normalize documents_needed (supports legacy documents key if AI slips)
    raw_docs = parsed.get("documents_needed", parsed.get("documents", []))
    if isinstance(raw_docs, list):
        documents_needed = [str(doc).strip() for doc in raw_docs if doc]
    elif isinstance(raw_docs, str):
        documents_needed = [raw_docs.strip()]
    else:
        documents_needed = ["Relevant receipts, identity proof, or previous correspondence."]

    # Normalize sources
    raw_sources = parsed.get("sources", [])
    if isinstance(raw_sources, list):
        sources = [str(src).strip() for src in raw_sources if src]
    elif isinstance(raw_sources, str):
        sources = [raw_sources.strip()]
    else:
        sources = []

    disclaimer = str(parsed.get(
        "disclaimer",
        "This is general informational guidance and is not a substitute for professional legal advice."
    )).strip()

    return {
        "situation": situation,
        "category": category,
        "what_you_can_do": what_you_can_do,
        "documents_needed": documents_needed,
        "sources": sources,
        "disclaimer": disclaimer,
    }


def generate_civic_guidance(problem: str) -> Dict[str, Any]:
    """
    Sends the citizen's problem description to Groq API and returns structured guidance.
    
    Args:
        problem (str): User's description of their legal/civic issue.
        
    Returns:
        Dict[str, Any]: Parsed and sanitized response containing situation, category,
                        what_you_can_do, documents_needed, sources, and disclaimer.
                        
    Raises:
        GroqClientError: If the API call fails or returns an unparseable response.
    """
    client = get_groq_client()
    model = os.getenv("GROQ_MODEL", DEFAULT_GROQ_MODEL).strip() or DEFAULT_GROQ_MODEL

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": CIVICAI_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": build_user_prompt(problem)
                }
            ],
            model=model,
            response_format={"type": "json_object"},
            temperature=0.2,
        )

        choices = getattr(chat_completion, "choices", [])
        if not choices:
            raise GroqClientError("No response choices returned by Groq API.")

        message_content = choices[0].message.content
        if not message_content:
            raise GroqClientError("Empty response content received from Groq.")

        # Parse JSON content safely
        cleaned_json = clean_json_string(message_content)
        parsed_json = json.loads(cleaned_json)

        return sanitize_groq_response(parsed_json)

    except json.JSONDecodeError as exc:
        raise GroqClientError(f"Failed to parse Groq output as valid JSON: {exc}. Raw content: {message_content[:200]}")
    except GroqClientError:
        raise
    except Exception as exc:
        raise GroqClientError(f"Error communicating with Groq API: {str(exc)}")
