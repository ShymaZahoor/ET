document.addEventListener("DOMContentLoaded", function () {

    loadDashboard();

    loadGraphs();

    setInterval(
        loadDashboard,
        5000
    );

});


// =========================
// Dashboard Data
// =========================

async function loadDashboard() {

    try {

        // Latest Sensor Data

        const latestResponse = await fetch(
            "http://127.0.0.1:5000/latest"
        );

        const latest = await latestResponse.json();


        const temperature = document.getElementById("temperature");
        const humidity = document.getElementById("humidity");
        const animal = document.getElementById("animal");


        if (temperature) {
            temperature.innerHTML =
                (latest.temperature ?? "--") + " °C";
        }


        if (humidity) {
            humidity.innerHTML =
                (latest.humidity ?? "--") + " %";
        }


        if (animal) {

            animal.innerHTML =
                latest.motion == 1
                ? "Animal detected"
                : "No activity";

        }



        // =========================
        // Habitat Prediction
        // =========================

        const habitatResponse = await fetch(
            "http://127.0.0.1:5000/habitat"
        );


        const habitat = await habitatResponse.json();



        const habitatElement = document.getElementById("habitat");
        const confidenceElement = document.getElementById("confidence");


        if (habitatElement) {

            habitatElement.innerHTML =
                habitat["Habitat Prediction"] || "Unknown";

        }


        if (confidenceElement) {

            confidenceElement.innerHTML =
                (habitat.Confidence ?? "--") + " %";

        }




        // =========================
        // AI Alert
        // =========================

        const anomalyResponse = await fetch(
            "http://127.0.0.1:5000/anomaly"
        );


        const anomaly = await anomalyResponse.json();



        const alertElement = document.getElementById("alert");


        if (alertElement) {

            alertElement.innerHTML =
                anomaly["Anomaly"] || "Normal habitat conditions";

        }



    }


    catch(error) {

        console.log(
            "Dashboard Error:",
            error
        );

    }

}





// =========================
// Environmental Graph
// =========================


let environmentChart = null;



async function loadGraphs() {


    try {


        const response = await fetch(
            "http://127.0.0.1:5000/history"
        );


        const data = await response.json();



        if (!data || data.length === 0) {

            console.log("No graph data available");
            return;

        }




        const labels = data.map(
            item => {

                if (item.timestamp) {

                    return item.timestamp.substring(11,19);

                }

                return "";

            }
        );



        const temperatures = data.map(
            item => item.temperature
        );



        const humidities = data.map(
            item => item.humidity
        );





        const canvas = document.getElementById(
            "environmentChart"
        );



        if (!canvas) {

            console.log(
                "Chart canvas not found"
            );

            return;

        }





        if (environmentChart) {

            environmentChart.destroy();

        }




        environmentChart = new Chart(

            canvas,

            {

                type: "line",


                data: {


                    labels: labels,


                    datasets: [

                        {

                            label: "Temperature °C",

                            data: temperatures

                        },


                        {

                            label: "Humidity %",

                            data: humidities

                        }


                    ]


                },


                options: {


                    responsive: true,


                    maintainAspectRatio: false,


                    scales: {


                        y: {

                            beginAtZero: false

                        }


                    }


                }


            }

        );



    }


    catch(error) {


        console.log(
            "Graph Error:",
            error
        );


    }


}