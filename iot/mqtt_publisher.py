import os
import sys
import time
import json
import random
from datetime import datetime
import paho.mqtt.client as mqtt

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "ecotwin/sensors"

def generate_telemetry():
    return {
        "temperature": round(random.uniform(18.0, 38.0), 2),
        "humidity": round(random.uniform(25.0, 95.0), 2),
        "soil_moisture": round(random.uniform(10.0, 85.0), 2),
        "rainfall": round(random.uniform(0.0, 35.0), 2),
        "light": round(random.uniform(0.0, 950.0), 2),
        "acoustic": round(random.uniform(20.0, 85.0), 2),
        "motion": random.choice([0, 0, 0, 1]),
        "season": random.choice(["summer", "monsoon", "winter"]),
        "timestamp": datetime.utcnow().isoformat()
    }

def run_publisher():
    client = mqtt.Client()
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        print(f"[+] Connected to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT}")
    except Exception as e:
        print(f"[-] Could not connect to MQTT broker: {e}")
        print("[!] Ensure Mosquitto service is running on your machine.")
        return

    while True:
        payload = generate_telemetry()
        client.publish(MQTT_TOPIC, json.dumps(payload))
        print(f"[+] Published telemetry payload to topic '{MQTT_TOPIC}': {payload}")
        time.sleep(5)

if __name__ == "__main__":
    run_publisher()
