import pandas as pd
import numpy as np

from sklearn.preprocessing import MinMaxScaler

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM
from tensorflow.keras.layers import Dense

df = pd.read_csv("data/processed_readings.csv")

data = df[
    [
        "temperature",
        "humidity",
        "soil_moisture"
    ]
]


scaler = MinMaxScaler()

scaled = scaler.fit_transform(data)

X = []
y = []

sequence_length = 20

for i in range(sequence_length, len(scaled)):
    X.append(scaled[i-sequence_length:i])
    y.append(scaled[i])

X = np.array(X)
y = np.array(y)


print(X.shape)
print(y.shape)

model = Sequential()

model.add(
    LSTM(
        64,
        input_shape=(20,3)
    )
)

model.add(Dense(32))

model.add(Dense(3))

model.compile(
    optimizer="adam",
    loss="mse"
)

history = model.fit(
    X,
    y,
    epochs=20,
    batch_size=32,
    validation_split=0.2
)

model.save(
    "models/lstm_model.keras"
)

print("Model Saved")

prediction = model.predict(
    X[-1].reshape(1,20,3)
)

prediction = scaler.inverse_transform(prediction)

print(prediction)


forecast = pd.DataFrame(
    prediction,
    columns=[
        "temperature",
        "humidity",
        "soil_moisture"
    ]
)

forecast.to_csv(
    "data/forecast.csv",
    index=False
)

print("Forecast Saved")