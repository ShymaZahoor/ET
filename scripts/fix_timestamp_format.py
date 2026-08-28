"""
scripts/fix_timestamp_format.py
EcoTwin AIoT — One-Time Database Timestamp Normalization Migration Script.

Reads every row in `sensor_data` from `data/ecotwin.db`, parses `timestamp` using
pd.to_datetime(..., format="mixed", utc=True), and updates naive or inconsistent
timestamp strings to standardized ISO 8601 UTC strings with offset (e.g. 2026-07-23T14:15:17.227860+00:00).
"""

import os
import sys
import sqlite3
import pandas as pd
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

DB_PATH = os.path.join(PROJECT_ROOT, "data", "ecotwin.db")


def normalize_timestamps():
    if not os.path.exists(DB_PATH):
        print(f"[-] Database file not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT id, timestamp FROM sensor_data")
    rows = cur.fetchall()

    if not rows:
        print("[*] sensor_data table is empty.")
        conn.close()
        return

    total_rows = len(rows)
    updated_rows = 0
    already_normalized = 0

    updates = []
    for row_id, ts_val in rows:
        if not ts_val:
            normalized_ts = datetime.now(timezone.utc).isoformat()
            updates.append((normalized_ts, row_id))
            updated_rows += 1
            continue

        try:
            parsed_dt = pd.to_datetime(ts_val, format="mixed", utc=True)
            normalized_ts = parsed_dt.isoformat()
            if normalized_ts != str(ts_val):
                updates.append((normalized_ts, row_id))
                updated_rows += 1
            else:
                already_normalized += 1
        except Exception as err:
            normalized_ts = datetime.now(timezone.utc).isoformat()
            updates.append((normalized_ts, row_id))
            updated_rows += 1

    if updates:
        cur.executemany("UPDATE sensor_data SET timestamp = ? WHERE id = ?", updates)
        conn.commit()

    conn.close()

    print("\n========================================================")
    print(" [+] ECOTWIN TIMESTAMP NORMALIZATION MIGRATION COMPLETE")
    print("========================================================")
    print(f" Total Rows Processed  : {total_rows}")
    print(f" Rows Updated & Fixed  : {updated_rows}")
    print(f" Rows Already Standard : {already_normalized}")
    print("========================================================\n")


if __name__ == "__main__":
    normalize_timestamps()
