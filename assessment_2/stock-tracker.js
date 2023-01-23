const DATA_POINT_KEY = {
    OPEN: "1. open",
    CLOSE: "4. close",
    HIGH: "2. high",
    LOW: "3. low"
}
function fetchStockData() {
    const canvasWrapper = document.getElementById("canvas-wrapper");
    const ticker = document.getElementById("ticker-symbol-field");
    if(ticker.value) {
        const fetchButton = document.getElementById("stock-fetch-button");
        
        // disable input and fetchButton
        ticker.setAttribute("disabled", "disabled");
        fetchButton.setAttribute("disabled", "disabled");

        const enableInputAndButton = ()=> {
            ticker.removeAttribute("disabled");
            fetchButton.removeAttribute("disabled");
        }

        const URL = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker.value}&interval=5min&apikey=E7FFHELXRFSRGZAU`;
        fetch(URL)
            .then(response => response.json())
            .then(data => {
                const dataPoints = [];
                const timePoints = Object.keys(data['Time Series (5min)']).map((key) => {
                    dataPoints.push(data['Time Series (5min)'][key]);
                    return new Date(key);
                });
                // sort data chronologically
                for(let i = 0; i < timePoints.length; i++) {
                    for(let j = i + 1; j < timePoints.length; j++) {
                        if(timePoints[j] < timePoints[i]) {
                            const tempTime = timePoints[j];
                            const tempDataPoint = dataPoints[j];
                            timePoints[j] = timePoints[i];
                            dataPoints[j] = dataPoints[i];
                            timePoints[i] = tempTime;
                            dataPoints[i] = tempDataPoint;
                        }
                    }
                }
                canvasWrapper.classList = "";
                populateCanvas(dataPoints, timePoints);
                enableInputAndButton();
            })
            .catch(e => {
                if(!canvasWrapper.classList.contains("no-border")){
                    canvasWrapper.classList = "no-border";
                }
                console.error("Error in fetching the data", e);
                alert("Unexpected Error!\nFailed to fetch the stock data.\nTry again or see console for details.");
                enableInputAndButton();
            });
    } else {
        if(!canvasWrapper.classList.contains("no-border")){
            canvasWrapper.classList = "no-border";
        }
        alert("Ticker symbol is required to fetch and track stocks.\nKindly type in a ticker symbol.");
        ticker.focus();
    }
}

function populateCanvas(dataPoints, timePoints) {
    const canvas = document.getElementById("stock-tracker-canvas");
    const context = canvas.getContext("2d");
    const CHART_HEIGHT = 400;
    const CHART_WIDTH = 700;
    const POINT_TOP = 10;
    const POINT_LEFT = 10;
    const POINT_RIGHT = 710;
    const POINT_BOTTOM = 410;

    const data = dataPoints.map(d => d[DATA_POINT_KEY.CLOSE]);
    const NO_OF_DATA_POINTS = data.length;
    const BIGGEST = data.reduce((a,b) => a > b ? a : b, data[0]);
    const SMALLEST = data.reduce((a,b) => a < b ? a : b, data[0]);
    const RANGE = (BIGGEST - SMALLEST);

    // clear canvas
    context.clearRect(0, 0, 760, 440);

    // x and y axes
    context.beginPath();
    context.moveTo(POINT_LEFT, POINT_BOTTOM);
    context.lineTo(POINT_RIGHT, POINT_BOTTOM);
    context.lineTo(POINT_RIGHT, POINT_TOP);
    context.stroke();

    // reference lines
    const NO_OF_SPLITS = 5;
    for(let i = 0; i < NO_OF_SPLITS; i++) {
        context.beginPath();
        context.strokeStyle = "#CCC";
        context.moveTo(POINT_LEFT, (CHART_HEIGHT * i / NO_OF_SPLITS) + POINT_TOP);
        context.lineTo(POINT_RIGHT, (CHART_HEIGHT * i / NO_OF_SPLITS) + POINT_TOP);
        context.fillText(BIGGEST - (RANGE / NO_OF_SPLITS * i), POINT_RIGHT + 10, (CHART_HEIGHT * i / NO_OF_SPLITS) + POINT_TOP);
        context.stroke();
    }

    // plot the line graph
    context.beginPath();
    context.lineJoin = "round";
    context.strokeStyle = "black";
    const plots = [];
    // loop over data and plot line graph to the points
    for(let i = 0; i < NO_OF_DATA_POINTS; i++){
        const pos = {
            x: POINT_RIGHT * (i / NO_OF_DATA_POINTS) + POINT_LEFT,
            y: (CHART_HEIGHT - (data[i] - SMALLEST) / RANGE * CHART_HEIGHT) + POINT_TOP
        }
        plots.push(pos);
        context.lineTo(pos.x, pos.y);
        // context.fillText((i + 1), POINT_RIGHT * i / NO_OF_DATA_POINTS + 7.5, POINT_BOTTOM + 15);  
    }
    context.stroke();
    // plot the points on line graph
    for(let i = 0; i < NO_OF_DATA_POINTS; i++){
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(plots[i].x, plots[i].y, 2.5, 0, 2 * Math.PI);
        generatePointStatistics(plots[i], dataPoints[i], timePoints[i]);
        context.fill();
    }

    // x and y axes' units
    context.fillText( "Stock Tracker with 5 minutes of time interval", POINT_RIGHT / 3, POINT_BOTTOM + 20);
    // context.fillText( "Points", POINT_RIGHT + 5, CHART_HEIGHT / 2);
    context.beginPath();
    context.lineJoin = "round";
    context.strokeStyle = "black";

    /*context.moveTo(POINT_LEFT, (CHART_HEIGHT - data[0] / BIGGEST * CHART_HEIGHT) + POINT_TOP);  
    // draw reference value for day of the week  
    // context.fillText( "1", 15, GRAPH_BOTTOM + 25);  
    for( var i = 0; i < NO_OF_DATA_POINTS; i++ ){  
        context.lineTo(POINT_RIGHT * i / NO_OF_DATA_POINTS + POINT_LEFT, (CHART_HEIGHT - data[i] / BIGGEST * CHART_HEIGHT) + POINT_TOP);  
        // draw reference value for day of the week  
    }  
    context.stroke();   */
}

function generatePointStatistics(plot, point, time) {
    const wrapper = document.getElementById("canvas-wrapper");

    const statsElementWrapper = document.createElement("div");
    statsElementWrapper.setAttribute("class", "point-statistics-wrapper");
    statsElementWrapper.style.left = (plot.x - 3) + "px";
    statsElementWrapper.style.top = (plot.y + 7) + "px";

    const statsElement = document.createElement("div");
    statsElement.setAttribute("class", "point-statistics");
    statsElement.innerHTML = `
    <div class="stats-header">Stock Details:</div>
    <table>
        <tr>
            <td>Date</td><td>:</td><td class="point-stat-time">${time.toDateString()}</td>
        </tr>
        <tr>
            <td>Time</td><td>:</td><td class="point-stat-time">${time.toLocaleTimeString()}</td>
        </tr>
        <tr>
            <td>Open</td><td>:</td><td class="point-stat-value">${point[DATA_POINT_KEY.OPEN]}</td>
        </tr>
        <tr>
            <td>Close</td><td>:&nbsp;&nbsp;${
                (parseFloat(point[DATA_POINT_KEY.CLOSE]) < parseFloat(point[DATA_POINT_KEY.OPEN]) && "<span class='closed-low'>↓</span>") ||
                (parseFloat(point[DATA_POINT_KEY.CLOSE]) > parseFloat(point[DATA_POINT_KEY.OPEN]) && "<span class='closed-high'>↑</span>") || ""
            }</td><td class="point-stat-value">${point[DATA_POINT_KEY.CLOSE]}</td>
        </tr>
        <tr>
            <td>High</td><td>:</td><td class="point-stat-value">${point[DATA_POINT_KEY.HIGH]}</td>
        </tr>
        <tr>
            <td>Low</td><td>:</td><td class="point-stat-value">${point[DATA_POINT_KEY.LOW]}</td>
        </tr>
    </table>`;
    statsElementWrapper.appendChild(statsElement);
    wrapper.appendChild(statsElementWrapper);
}
