import pandas as pd
from privacy.hashing import hash_account_id

PII_COLUMNS = [
    "name", "email", "phone", "address", "ip",
    "ssn", "dob", "date_of_birth", "sender_name", "receiver_name",
]


def anonymize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Drop known PII columns and replace sender/receiver IDs with salted hashes."""
    df = df.copy()

    for col in list(df.columns):
        if col.lower() in PII_COLUMNS:
            df.drop(columns=[col], inplace=True)

    if "sender" in df.columns:
        df["sender_hash"] = df["sender"].astype(str).apply(hash_account_id)
        df.drop(columns=["sender"], inplace=True)

    if "receiver" in df.columns:
        df["receiver_hash"] = df["receiver"].astype(str).apply(hash_account_id)
        df.drop(columns=["receiver"], inplace=True)

    return df
