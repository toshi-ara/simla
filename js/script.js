//////////////////////////////////
// variables
//////////////////////////////////

// object fot timer
let time = {
    isRunning:  false,
    start:   Date.now(),
    elapsed: 0,
    total:   0
}

// parameters of drugs for each individual
let param = setParameter(MU0, LOG_SIGMA0, ADR, MU0_adj, D_MU0);

// PC or tablet
const clickEventType = (window.ontouchstart === undefined) ? "mousedown" : "touchstart";

// object for EventListner
const elem = {};


//////////////////////////////////
// setting of display
//////////////////////////////////

window.onload = ()=>{
    const canvas = document.getElementById("canvas");

    // set canvas
    const context = canvas.getContext("2d");
    const img = new Image();
    img.src = path_to_fig;
    img.onload = () => {
        // display image
        context.drawImage(img, 0, 0);
        // draw circles
        CENTERS.forEach(function(center) {
            drawCircle(context, center,
                       Rnormal, RnormalCenter, "black")
        });
    };

    // add EventListener to buttons, slider, timer and canvas
    ["newexp", "start", "quit", "slider", "timer", "canvas"].forEach(function(id) {
        elem[id] = document.getElementById(id)
    });
    elem.newexp.addEventListener(clickEventType, clickNewExp, false);
    elem.start.addEventListener(clickEventType, clickStart, false);
    elem.quit.addEventListener(clickEventType, clickQuit, false);
    elem.canvas.addEventListener(clickEventType,
        (e) => {clickCanvas(canvas, context, e)}, false);
    elem.slider.addEventListener("input", sliderChanged, false);

    // restore parameters if data is saved in localStorage
    const storage = getStorage();
    if (Object.keys(storage).length > 0) {
        time = storage.time;
        slider.value = storage.speed;
        param = storage.param;
    }

    // process in reload of browser
    // start/restart/pause button
    let label;
    if (time.isRunning) {
        label = label_pause;
    } else {
        if (time.total == 0) {
            label = label_start;
        } else {
            label = label_restart;
        }
    }
    elem.start.textContent = label;
    elem.newexp.textContent = label_newexp;
    elem.quit.textContent = label_quit;
    toggleButton(time.isRunning);
    // slider
    printSpeed(slider.value)

    // display timer
    displayTimer();
};


//////////////////////////////////
// main function
// mousedown in canvas area
//////////////////////////////////

function clickCanvas(canvas, context, e) {
    if (!time.isRunning) { return }
    // running
    const pos = getClickedPosition(canvas, e);
    const site = getCircleNumber(pos, CENTERS, Rnormal);

    if (site < 0) { return }
    // when clicked in circles
    const Time = (time.total + time.elapsed) / 60000; // (min)
    const isResponse = getResponse(site, Time, param);

    if (isResponse) {
        // effects with response
        fillRect(context, CENTERS[site], Rrespond);
        drawCircle(context, CENTERS[site],
                   Rrespond, RrespondCenter, "red");
        response.textContent = label_with_response;
        response.style.color = "red";

        setTimeout(function() {
            fillRect(context, CENTERS[site], Rrespond);
            drawCircle(context, CENTERS[site],
                       Rnormal, RnormalCenter, "black");
            response.textContent = "";
        }, 300);
    } else {
        // effects without response
        response.textContent = label_without_response;
        response.style.color = "black";
        setTimeout(function() {
            response.textContent = "";
        }, 300);
    }
}


//////////////////////////////////
// buttons
//////////////////////////////////

// push new experiment button
function clickNewExp() {
    if (time.isRunning) { return }
    // in pause
    const check = window.confirm(msg_newexp);
    if (check) {
        time.isRunning = false;
        time.start = Date.now();
        time.elapsed = 0;
        time.total = 0;
        param = setParameter(MU0, LOG_SIGMA0, ADR, MU0_adj, D_MU0);
        slider.value = 1;
        setStorage();
        printSpeed(slider.value);
        elem.start.textContent = label_start;
    }
}

// push start/restart/pause button
function clickStart() {
    if (!time.isRunning) { // before start / in pause
        time.isRunning = true;          // running
        time.start = Date.now();
        time.elapsed = 0;
        elem.start.textContent = label_pause;
        toggleButton(true);
    }
    else { // in running
        time.isRunning = false;         // pause
        time.total += time.elapsed;
        elem.start.textContent = label_restart;
        toggleButton(false);
    }
    setStorage();
}

// push quit button
function clickQuit() {
    if (time.isRunning) { return }
    // in pause
    const check = window.confirm(msg_quit);
    if (check) {
        clearStorage();
        window.alert(msg_close);
    }
}

function toggleButton(isRunning) {
    if (isRunning) {
        elem.newexp.style.color = "gray";
        elem.quit.style.color = "gray";
    } else {
        elem.newexp.style.color = "black";
        elem.quit.style.color = "black";
    }
}


//////////////////////////////////
// slider
//////////////////////////////////

// change slider
function sliderChanged() {
    printSpeed(slider.value)
    if (time.isRunning) {
        time.total += time.elapsed;
        time.start = Date.now();
        time.elapsed = 0;
    }
    setStorage();
}

function printSpeed(speed) {
    speed_msg.textContent = speed + label_speed;
}


//////////////////////////////////
// timer
//////////////////////////////////

// display timer
function displayTimer() {
    let t;
    if (time.isRunning) {
        time.elapsed = (Date.now() - time.start) * slider.value;
        t = time.total + time.elapsed;
    } else {
        t = time.total;
    }
    elem.timer.textContent = timeFormat(t);
    requestAnimationFrame(displayTimer);
}

function timeFormat(t) {
    return Math.floor(t / 36e5) + new Date(t).toISOString().slice(13, 19);
}


//////////////////////////////////
// localStrage
//////////////////////////////////

// save data to localStorage
function setStorage() {
    localStorage.setItem(storageName, JSON.stringify({
        time:  time,
        speed: slider.value,
        param: param
    }));
}

// get data in localStorage
function getStorage() {
    const params = localStorage.getItem(storageName);
    return params ? JSON.parse(params) : {};
}

// delete data in localStorage
function clearStorage() {
    localStorage.removeItem(storageName);
}

