import hashlib
import os

_SALT = os.getenv("HASH_SALT", "finguard-default-salt")

def hash_account_id(account_id: str) -> str:
    return hashlib.sha256(f"{_SALT}{account_id}".encode()).hexdigest()
