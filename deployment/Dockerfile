FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

# Seed initial telemetry data & train ML models during build
RUN python iot/data_generator.py && \
    python habitat_prediction/train_habitat.py && \
    python anomaly_detection/train_anomaly.py && \
    python forecasting/train_forecast.py && \
    python edge/export_tflite.py

EXPOSE 5000

ENV FLASK_APP=backend.app:app

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "backend.app:app"]
