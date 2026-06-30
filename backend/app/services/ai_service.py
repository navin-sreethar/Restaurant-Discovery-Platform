"""
AI Service — Gemini Integration
Handles all 4 AI generation features using Google's Gemini 1.5 Flash model.

The Prompt Registry pattern keeps prompts organized and easy to update
without touching the API logic.
"""
import google.generativeai as genai
from config import settings

# ─────────────────────────────────────────
# PROMPT REGISTRY
# Each entry has a system_prompt (Gemini's "role") and a template function
# that builds the user prompt from restaurant data.
# ─────────────────────────────────────────

PROMPT_REGISTRY = {
    "summary": {
        "system_prompt": (
            "You are an expert culinary researcher and restaurant analyst. "
            "Provide clear, factual, and engaging restaurant summaries."
        ),
        "template": lambda r: (
            f"Write a concise 3-sentence summary for the restaurant '{r['name']}' "
            f"specializing in {r['cuisine']} cuisine, located at {r['address']}, {r['city']}, {r['state']}. "
            f"Their current rating is {r['rating']}/5. "
            f"Additional notes: {r['notes'] or 'None provided'}. "
            f"Keep the tone professional and informative."
        )
    },

    "sentiment": {
        "system_prompt": (
            "You are a customer experience analyst specializing in restaurant reviews. "
            "Analyze sentiment and provide actionable insights."
        ),
        "template": lambda r: (
            f"Based on the following information about '{r['name']}' ({r['cuisine']} restaurant in {r['city']}): "
            f"Rating: {r['rating']}/5. Notes: {r['notes'] or 'No customer notes available'}. "
            f"Provide a 2-3 sentence customer sentiment summary covering: "
            f"1) Overall sentiment (positive/neutral/negative), "
            f"2) What customers likely appreciate, "
            f"3) One area for potential improvement."
        )
    },

    "marketing": {
        "system_prompt": (
            "You are a professional marketing copywriter specializing in the restaurant industry. "
            "Write compelling, engaging marketing copy that drives customer interest."
        ),
        "template": lambda r: (
            f"Write a short, punchy marketing description (2-3 sentences, max 80 words) for '{r['name']}', "
            f"a {r['cuisine']} restaurant in {r['city']}, {r['state']}. "
            f"Rating: {r['rating']}/5. Opening hours: {r['opening_hours'] or 'Varies'}. "
            f"Make it exciting and suitable for social media or a website hero section. "
            f"Do not use clichés like 'culinary journey' or 'delight your senses'."
        )
    },

    "outreach": {
        "system_prompt": (
            "You are a highly effective business development representative. "
            "Write personalized, professional outreach emails that get responses."
        ),
        "template": lambda r: (
            f"Write a professional business partnership outreach email to the owner of '{r['name']}', "
            f"a {r['cuisine']} restaurant at {r['address']}, {r['city']}. "
            f"{'Website: ' + r['website'] if r.get('website') else ''} "
            f"The email should: introduce our restaurant discovery platform, "
            f"highlight the value of being featured, and include a clear call to action. "
            f"Keep it under 150 words. Be specific, not generic. "
            f"Subject line included."
        )
    }
}


# ─────────────────────────────────────────
# GEMINI AI SERVICE
# ─────────────────────────────────────────

def get_gemini_client():
    """Initialize and return the Gemini client."""
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in your .env file")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-2.5-flash")


def generate_ai_content(summary_type: str, restaurant_data: dict) -> dict:
    """
    Generate AI content for a restaurant using Gemini.

    Args:
        summary_type: One of 'summary', 'sentiment', 'marketing', 'outreach'
        restaurant_data: Dict with restaurant fields

    Returns:
        Dict with 'result' (AI text) and 'prompt_used' (the exact prompt sent)
    """
    if summary_type not in PROMPT_REGISTRY:
        raise ValueError(f"Unknown summary type: {summary_type}. Must be one of: {list(PROMPT_REGISTRY.keys())}")

    prompt_config = PROMPT_REGISTRY[summary_type]
    user_prompt = prompt_config["template"](restaurant_data)
    system_prompt = prompt_config["system_prompt"]

    model = get_gemini_client()

    # Combine system + user prompt for Gemini
    full_prompt = f"{system_prompt}\n\n{user_prompt}"

    response = model.generate_content(full_prompt)
    result_text = response.text.strip()

    return {
        "result": result_text,
        "prompt_used": full_prompt
    }
