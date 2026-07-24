import logging
import os
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

logger = logging.getLogger("finguard.database")

_anon_client: Client = None
_admin_client: Client = None

SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")


def get_client() -> Client:
    """Anon-key client. Safe for user-scoped auth operations."""
    global _anon_client
    if _anon_client is None:
        _anon_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _anon_client


def get_admin_client() -> Client:
    """Service-role client. Backend-only; never expose this key to the frontend."""
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _admin_client


def init_db() -> None:
    """
    Create required tables if they do not exist.

    Executes schema.sql through the `exec_sql` RPC (created by that same file).
    If the RPC is not yet installed, logs clear manual-setup instructions rather
    than crashing the app.
    """
    try:
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema_sql = f.read()
    except OSError as exc:
        logger.error("Could not read schema file %s: %s", SCHEMA_PATH, exc)
        return

    client = get_admin_client()
    try:
        client.rpc("exec_sql", {"sql": schema_sql}).execute()
        logger.info("Database schema verified/created successfully.")
    except Exception as exc:  # noqa: BLE001 - surface any RPC failure as guidance
        logger.warning(
            "Automatic schema creation failed (%s). "
            "Run database/schema.sql once in the Supabase SQL editor to enable it.",
            exc,
        )
