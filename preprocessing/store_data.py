import sqlite3
import json
import paho.mqtt.client as mqtt

conn = sqlite3.connect("data/ecotwin.db", check_same_thread=False)

conn.execute("""
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    temperature REAL,
    humidity REAL,
    soil_moisture REAL,
    rainfall REAL,
    light REAL,
    acoustic REAL,
    motion INTEGER
)
""")

conn.commit()

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())

    conn.execute("""
        INSERT INTO readings
        (timestamp, temperature, humidity, soil_moisture,
         rainfall, light, acoustic, motion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
    (
        data["timestamp"],
        data["temperature"],
        data["humidity"],
        data["soil_moisture"],
        data["rainfall"],
        data["light"],
        data["acoustic"],
        data["motion"]
    ))

    conn.commit()

    print("Stored:", data)

client = mqtt.Client()

client.on_message = on_message

client.connect("localhost", 1883, 60)

client.subscribe("ecotwin/sensors")

print("Listening for sensor data...")

client.loop_forever()