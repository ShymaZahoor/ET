import os
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
KERAS_MODEL_PATH = os.path.join(MODELS_DIR, "forecast_lstm_3h.keras")
H5_MODEL_PATH = os.path.join(MODELS_DIR, "forecast_lstm_3h.h5")
TFLITE_MODEL_PATH = os.path.join(MODELS_DIR, "forecast_lstm_3h.tflite")

def convert_to_tflite():
    target_path = KERAS_MODEL_PATH if os.path.exists(KERAS_MODEL_PATH) else H5_MODEL_PATH
    if not os.path.exists(target_path):
        print(f"[-] Keras model not found at {target_path}. Train forecasting model first.")
        return

    model = tf.keras.models.load_model(target_path, compile=False)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Configure supported ops for LSTM dynamic ops
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    converter._experimental_lower_tensor_list_ops = False

    tflite_model = converter.convert()

    with open(TFLITE_MODEL_PATH, "wb") as f:
        f.write(tflite_model)
    
    size_kb = os.path.getsize(TFLITE_MODEL_PATH) / 1024.0
    print(f"[+] Successfully exported TFLite edge model to {TFLITE_MODEL_PATH} ({size_kb:.2f} KB)")

if __name__ == "__main__":
    convert_to_tflite()
