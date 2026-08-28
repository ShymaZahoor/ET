import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

client = mqtt.Client()
client.connect("localhost", 1883, 60)

def generate_reading():
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "temperature": round(random.uniform(18, 35), 2),
        "humidity": round(random.uniform(35, 90), 2),
        "soil_moisture": round(random.uniform(20, 70), 2),
        "rainfall": round(random.uniform(0, 15), 2),
        "light": round(random.uniform(200, 1200), 2),
        "acoustic": round(random.uniform(30, 85), 2),
        "motion": random.choice([0, 0, 0, 1])
    }

print("EcoTwin Sensor Simulator Started...")

while True:
    reading = generate_reading()

    client.publish(
        "ecotwin/sensors",
        json.dumps(reading)
    )

    print("Published:", reading)

    time.sleep(1)