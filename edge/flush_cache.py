import os
import json
import requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_FILE = os.path.join(BASE_DIR, "edge", "local_cache.jsonl")
BACKEND_SYNC_URL = "http://127.0.0.1:5000/sync-edge"

def flush_offline_cache():
    if not os.path.exists(CACHE_FILE):
        print("[+] No offline cache file found. Edge buffer is empty.")
        return

    with open(CACHE_FILE, "r") as f:
        lines = f.readlines()

    if not lines:
        print("[+] Edge buffer is empty.")
        return

    remaining = []
    synced_count = 0

    for line in lines:
        if not line.strip():
            continue
        record = json.loads(line.strip())
        try:
            res = requests.post(BACKEND_SYNC_URL, json=record, timeout=3)
            if res.status_code == 200:
                synced_count += 1
            else:
                remaining.append(line)
        except Exception:
            remaining.append(line)

    with open(CACHE_FILE, "w") as f:
        f.writelines(remaining)

    print(f"[+] Successfully synced {synced_count} offline records to backend. {len(remaining)} remaining in cache.")

if __name__ == "__main__":
    flush_offline_cache()
