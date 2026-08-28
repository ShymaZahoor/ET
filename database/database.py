import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "ecotwin.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "database", "schema.sql")

def get_db_connection(db_path=DB_PATH):
    """Establishes and returns a connection to SQLite database."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path=DB_PATH):
    """Initializes database with table schema if not existing."""
    conn = get_db_connection(db_path)
    with open(SCHEMA_PATH, "r") as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized successfully at {DB_PATH}")
