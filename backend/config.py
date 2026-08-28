import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "ecotwin-super-secret-key-2026")
    DB_PATH = os.getenv("DB_PATH", os.path.join(BASE_DIR, "data", "ecotwin.db"))
    MODELS_DIR = os.getenv("MODELS_DIR", os.path.join(BASE_DIR, "models"))
    MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
    MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
