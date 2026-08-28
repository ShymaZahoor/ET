import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DATABASE_PATH = os.path.join(BASE_DIR, "data", "ecotwin.db")

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "ecotwin/sensors"