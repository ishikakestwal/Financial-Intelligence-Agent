from datetime import datetime

def parse_timestamp(ts: str) -> str:
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%d/%m/%Y %H:%M:%S", "%m/%d/%Y"):
        try:
            return datetime.strptime(ts, fmt).isoformat()
        except ValueError:
            continue
    return ts
