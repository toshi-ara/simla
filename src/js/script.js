import * as cval from "./cval.js";
import * as labels from "./labels.js";
import * as func from "./functions.js";

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
let param;

// PC or tablet
const clickEventType = (window.ontouchstart === undefined) ? "mousedown" : "touchstart";

// object for EventListner
const elem = {};


//////////////////////////////////
// setting of display
//////////////////////////////////

window.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById("canvas");

    // set canvas
    const context = canvas.getContext("2d");
    const img = new Image();
    img.src = cval.path_to_fig;
    img.onload = () => {
        // display image
        context.drawImage(img, 0, 0);
        // draw circles
        cval.CENTERS.forEach(function(center) {
            func.drawCircle(context, center,
                            cval.Rnormal, cval.RnormalCenter, "black")
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

    // parameters of drugs for each individual
    param = func.setInitParameter(cval.MU0, cval.LOG_SIGMA0, cval.ADR, cval.MU0_adj, cval.D_MU0);

    // restore parameters if data is saved in localStorage
    const storage = getStorage();
    if (Object.keys(storage).length > 0) {
        time = storage.time;
        slider.value = storage.speed;
        param = storage.param;
    }

    // process in reload of browser
    // start/restart/pause button
    let lab;
    if (time.isRunning) {
        lab = labels.pause;
    } else {
        if (time.total == 0) {
            lab = labels.start;
        } else {
            lab = labels.restart;
        }
    }
    elem.start.textContent = lab;
    elem.newexp.textContent = labels.newexp;
    elem.quit.textContent = labels.quit;
    toggleButton(time.isRunning);
    // slider
    printSpeed(slider.value)

    // display timer
    displayTimer();
})


//////////////////////////////////
// main function
// mousedown in canvas area
//////////////////////////////////

function clickCanvas(canvas, context, e) {
    if (!time.isRunning) { return }
    // running
    const pos = func.getClickedPosition(canvas, e);
    const site = func.getCircleNumber(pos, cval.CENTERS, cval.Rnormal);

    if (site < 0) { return }
    // when clicked in circles
    const Time = (time.total + time.elapsed) / 60000; // (min)
    const isResponse = func.getResponse(site, Time, param);

    if (isResponse) {
        // effects with response
        func.fillRect(context, cval.CENTERS[site], cval.Rrespond);
        func.drawCircle(context, cval.CENTERS[site],
                        cval.Rrespond, cval.RrespondCenter, "red");
        response.textContent = labels.with_response;
        response.style.color = "red";

        setTimeout(function() {
            func.fillRect(context, cval.CENTERS[site], cval.Rrespond);
            func.drawCircle(context, cval.CENTERS[site],
                            cval.Rnormal, cval.RnormalCenter, "black");
            response.textContent = "";
        }, 300);
    } else {
        // effects without response
        response.textContent = labels.without_response;
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
    const check = window.confirm(labels.msg_newexp);
    if (check) {
        time.isRunning = false;
        time.start = Date.now();
        time.elapsed = 0;
        time.total = 0;
        param = func.setInitParameter(cval.MU0, cval.LOG_SIGMA0, cval.ADR, cval.MU0_adj, cval.D_MU0);
        slider.value = 1;
        setStorage();
        printSpeed(slider.value);
        elem.start.textContent = labels.start;
    }
}

// push start/restart/pause button
function clickStart() {
    if (!time.isRunning) { // before start / in pause
        time.isRunning = true;          // running
        time.start = Date.now();
        time.elapsed = 0;
        elem.start.textContent = labels.pause;
        toggleButton(true);
    }
    else { // in running
        time.isRunning = false;         // pause
        time.total += time.elapsed;
        elem.start.textContent = labels.restart;
        toggleButton(false);
    }
    setStorage();
}

// push quit button
function clickQuit() {
    if (time.isRunning) { return }
    // in pause
    const check = window.confirm(labels.msg_quit);
    if (check) {
        clearStorage();
        window.alert(labels.msg_close);
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
    speed_msg.textContent = speed + labels.speed;
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
    localStorage.setItem(cval.storageName, JSON.stringify({
        time:  time,
        speed: slider.value,
        param: param
    }));
}

// get data in localStorage
function getStorage() {
    const params = localStorage.getItem(cval.storageName);
    return params ? JSON.parse(params) : {};
}

// delete data in localStorage
function clearStorage() {
    localStorage.removeItem(cval.storageName);
}

