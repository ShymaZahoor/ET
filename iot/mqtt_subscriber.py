import os
import sys
import json
import sqlite3
from datetime import datetime
import paho.mqtt.client as mqtt

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from digital_twin.twin_state import twin
from edge.edge_runner import edge_runner

DB_PATH = os.path.join(BASE_DIR, "data", "ecotwin.db")
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "ecotwin/sensors"

def on_connect(client, userdata, flags, rc):
    print(f"[+] Connected to MQTT Broker with result code {rc}")
    client.subscribe(MQTT_TOPIC)
    print(f"[+] Subscribed to topic '{MQTT_TOPIC}'")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        
        # Edge Intelligence Anomaly Evaluation
        eval_result = edge_runner.evaluate_telemetry(payload)

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""INSERT INTO sensor_data 
            (temperature, humidity, soil_moisture, rainfall, light, acoustic, motion, season, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (payload.get("temperature"), payload.get("humidity"), payload.get("soil_moisture"),
             payload.get("rainfall"), payload.get("light"), payload.get("acoustic"),
             payload.get("motion", 0), payload.get("season", "summer"),
             payload.get("timestamp", datetime.utcnow().isoformat())))
        conn.commit()

        # Log edge evaluation
        cur.execute("""INSERT INTO edge_logs 
            (reading_timestamp, is_anomaly, upload_status, processed_at)
            VALUES (?, ?, ?, ?)""",
            (payload.get("timestamp"), 1 if eval_result["is_anomaly"] else 0, "uploaded", eval_result["processed_at"]))
        conn.commit()
        conn.close()

        # Sync Digital Twin
        twin.sync_from_database()
        print(f"[+] MQTT Telemetry stored & Digital Twin state synchronized. Anomaly: {eval_result['is_anomaly']}")

    except Exception as e:
        print(f"[-] Error processing MQTT message: {e}")

def run_subscriber():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"[-] Could not start MQTT subscriber: {e}")

if __name__ == "__main__":
    run_subscriber()
