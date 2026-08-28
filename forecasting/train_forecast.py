import os
import sqlite3
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "ecotwin.db")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def build_and_train_lstm():
    os.makedirs(MODELS_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM sensor_data ORDER BY timestamp", conn)
    conn.close()

    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.set_index("timestamp").resample("1h").mean(numeric_only=True).ffill()

    feature_cols = ["temperature", "humidity", "soil_moisture", "rainfall"]
    data = df[feature_cols].values

    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data)
    scaler_path = os.path.join(MODELS_DIR, "forecast_scaler.pkl")
    joblib.dump(scaler, scaler_path)

    window_size = 24  # 24-hour lookback window
    horizons = {
        "3h": 3,
        "12h": 12,
        "24h": 24
    }

    for horizon_name, horizon_steps in horizons.items():
        X, y = [], []
        for i in range(len(scaled_data) - window_size - horizon_steps + 1):
            X.append(scaled_data[i : i + window_size])
            y.append(scaled_data[i + window_size + horizon_steps - 1])
        
        X, y = np.array(X), np.array(y)
        if len(X) == 0:
            print(f"[-] Not enough data points to train horizon {horizon_name}")
            continue

        split = int(len(X) * 0.8)
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        model = Sequential([
            Input(shape=(window_size, len(feature_cols))),
            LSTM(64, return_sequences=False),
            Dropout(0.2),
            Dense(32, activation="relu"),
            Dense(len(feature_cols))
        ])

        model.compile(optimizer="adam", loss="mse")
        model.fit(X_train, y_train, epochs=20, batch_size=16, validation_data=(X_test, y_test), verbose=0)

        # Save both .h5 and native Keras format for maximum compatibility
        h5_path = os.path.join(MODELS_DIR, f"forecast_lstm_{horizon_name}.h5")
        keras_path = os.path.join(MODELS_DIR, f"forecast_lstm_{horizon_name}.keras")
        model.save(h5_path)
        model.save(keras_path)
        print(f"[+] Saved LSTM forecast model for {horizon_name} horizon to {h5_path} and {keras_path}")

if __name__ == "__main__":
    build_and_train_lstm()
