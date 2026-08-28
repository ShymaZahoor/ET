@app.route("/habitat")
def habitat():

    print("1. Habitat API called")


    conn = sqlite3.connect(
        "data/ecotwin.db"
    )

    df = pd.read_sql(
        "SELECT * FROM readings ORDER BY id DESC LIMIT 1",
        conn
    )

    conn.close()


    print("2. Database loaded")
    print(df)


    if df.empty:
        return jsonify({
            "error": "No sensor data"
        })


    print("3. Loading model")


    model = joblib.load(
        "models/habitat_model.pkl"
    )


    print("4. Model loaded")


    latest = df[
        [
            "temperature",
            "humidity",
            "soil_moisture",
            "rainfall",
            "light",
            "acoustic",
            "motion"
        ]
    ]


    print("5. Features ready")
    print(latest)



    prediction = model.predict(
        latest
    )


    print("6. Prediction done")


    probability = model.predict_proba(
        latest
    )


    confidence = max(probability[0]) * 100


    return jsonify({

        "Habitat Prediction": prediction[0],

        "Confidence": round(confidence,2)

    })