import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
HASH_SALT = os.getenv("HASH_SALT", "finguard-default-salt")

# Groq AI configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


def validate_config() -> None:
    """Ensure required environment variables are present at startup."""
    missing = [
        name
        for name, value in {
            "SUPABASE_URL": SUPABASE_URL,
            "SUPABASE_ANON_KEY": SUPABASE_ANON_KEY,
            "SUPABASE_SERVICE_ROLE_KEY": SUPABASE_SERVICE_ROLE_KEY,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Copy .env.example to .env and fill in the values."
        )
