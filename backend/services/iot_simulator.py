import random
import time
import sqlite3
from datetime import datetime


DB_PATH = "data/ecotwin.db"


def generate_sensor_data():

    temperature = round(random.uniform(18, 35), 2)
    humidity = round(random.uniform(40, 90), 2)
    soil_moisture = round(random.uniform(30, 80), 2)
    rainfall = round(random.uniform(0, 50), 2)
    light = random.randint(100, 800)
    acoustic = random.randint(20, 100)
    motion = random.randint(0, 1)

    return (
        datetime.now(),
        temperature,
        humidity,
        soil_moisture,
        rainfall,
        light,
        acoustic,
        motion
    )


def insert_data(data):

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO readings
    (timestamp, temperature, humidity, soil_moisture,
     rainfall, light, acoustic, motion)

    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, data)

    conn.commit()
    conn.close()


print("EcoTwin IoT Simulator Started")


while True:

    sensor_data = generate_sensor_data()

    print("\nNew Sensor Reading")
    print("------------------")
    print("Temperature:", sensor_data[1])
    print("Humidity:", sensor_data[2])
    print("Soil Moisture:", sensor_data[3])
    print("Rainfall:", sensor_data[4])
    print("Animal Motion:", sensor_data[7])

    insert_data(sensor_data)

    print("Data inserted successfully")

    time.sleep(10)