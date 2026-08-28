# -------------------------
# Latest Sensor Reading
# -------------------------

@app.route("/latest")
def latest():

    try:

        # Synchronize Digital Twin with database
        twin.sync_from_database()

        # Return latest state
        return jsonify(
            twin.current_state
        )

    except Exception as e:

        return jsonify({

            "error": str(e)

        })