//////////////////////////////////
// variables
//////////////////////////////////

// object for timer
let time = {
    isRunning:  false,
    start:   Date.now(),
    elapsed: 0,
    total:   0
}

// variable for lang
let lang;

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
    ["lang", "newexp", "start", "quit", "slider", "timer", "canvas", "response"].forEach(function(id) {
        elem[id] = document.getElementById(id)
    });

    // set canvas
    const context = elem.canvas.getContext("2d");
    const img = new Image();
    img.src = cval_path_to_fig;
    img.onload = () => {
        // display image
        context.drawImage(img, 0, 0);
        // draw circles
        cval_CENTERS.forEach(function(center) {
            drawCircle(context, center,
                       cval_Rnormal, cval_RnormalCenter, "black")
        });
    };

    // add EventListener to buttons, slider, timer and canvas
    elem.newexp.addEventListener(clickEventType, clickNewExp, false);
    elem.start.addEventListener(clickEventType, clickStart, false);
    elem.quit.addEventListener(clickEventType, clickQuit, false);
    elem.canvas.addEventListener(clickEventType,
        (e) => {clickCanvas(canvas, context, e)}, false);
    elem.slider.addEventListener("input", sliderChanged, false);
    elem.lang.addEventListener("change", toggleLang, false);

    // parameters of drugs for each individual
    param = setInitParameter(cval_MU0, cval_LOG_SIGMA0, cval_ADR, cval_MU0_adj, cval_D_MU0);

    // restore parameters if data is saved in localStorage
    const storage = getStorage();
    if (Object.keys(storage).length > 0) {
        time = storage.time;
        slider.value = storage.speed;
        param = storage.param;
    }

    // process in reload of browser
    lang = getStorageLang();
    elem.lang.la[lang].checked = true;
    setLang(lang);

    // change buttons status
    toggleButton(time.isRunning);

    // display timer
    displayTimer();
})


//////////////////////////////////
// redraw buttons in each language
//////////////////////////////////

function toggleLang() {
    lang = elem.lang.elements.la.value;
    setLang(lang)
    setStorageLang(lang)
}

function setLang(lang) {
    // start/restart/pause button
    let lab;
    if (time.isRunning) {
        lab = labels_pause;
    } else {
        if (time.total == 0) {
            lab = labels_start;
        } else {
            lab = labels_restart;
        }
    }
    elem.start.textContent = lab[lang];
    elem.newexp.textContent = labels_newexp[lang];
    elem.quit.textContent = labels_quit[lang];
    toggleButton(time.isRunning);

    // slider
    printSpeed(slider.value)
}


//////////////////////////////////
// main function
// mousedown in canvas area
//////////////////////////////////

function clickCanvas(canvas, context, e) {
    if (!time.isRunning) { return }
    // running
    const pos = getClickedPosition(canvas, e);
    const site = getCircleNumber(pos, cval_CENTERS, cval_Rnormal);

    if (site < 0) { return }
    // when clicked in circles
    const Time = (time.total + time.elapsed) / 60000; // (min)
    const isResponse = getResponse(site, Time, param);

    if (isResponse) {
        // effects with response
        fillRect(context, cval_CENTERS[site], cval_Rrespond);
        drawCircle(context, cval_CENTERS[site],
                        cval_Rrespond, cval_RrespondCenter, "red");
        elem.response.textContent = labels_with_response[lang];
        elem.response.style.color = "red";

        setTimeout(function() {
            fillRect(context, cval_CENTERS[site], cval_Rrespond);
            drawCircle(context, cval_CENTERS[site],
                            cval_Rnormal, cval_RnormalCenter, "black");
            elem.response.textContent = "";
        }, 300);
    } else {
        // effects without response
        elem.response.textContent = labels_without_response[lang];
        elem.response.style.color = "black";
        setTimeout(function() {
            elem.response.textContent = "";
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
    const check = window.confirm(labels_msg_newexp[lang]);
    if (check) {
        time.isRunning = false;
        time.start = Date.now();
        time.elapsed = 0;
        time.total = 0;
        param = setInitParameter(cval_MU0, cval_LOG_SIGMA0, cval_ADR, cval_MU0_adj, cval_D_MU0);
        slider.value = 1;
        setStorage();
        setLang(lang)
    }
}

// push start/restart/pause button
function clickStart() {
    if (!time.isRunning) { // before start / in pause
        time.isRunning = true;          // running
        time.start = Date.now();
        time.elapsed = 0;
        setLang(lang)
        toggleButton(true);
    }
    else { // in running
        time.isRunning = false;         // pause
        time.total += time.elapsed;
        setLang(lang)
        toggleButton(false);
    }
    setStorage();
}

// push quit button
function clickQuit() {
    if (time.isRunning) { return }
    // in pause
    const check = window.confirm(labels_msg_quit[lang]);
    if (check) {
        clearStorage();
        window.alert(labels_msg_close[lang]);
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
    speed_msg.textContent = speed + labels_speed[lang];
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
    localStorage.setItem(cval_storageName, JSON.stringify({
        time:  time,
        speed: slider.value,
        param: param
    }));
}

// get data in localStorage
function getStorage() {
    const params = localStorage.getItem(cval_storageName);
    return params ? JSON.parse(params) : {};
}

// save data to localStorage (lang)
function setStorageLang(lang) {
    localStorage.setItem(cval_storageNameLang, lang)
}

// get data in localStorage (lang)
function getStorageLang() {
    const lang = localStorage.getItem(cval_storageNameLang);
    return lang ? lang: 0
}

// delete data in localStorage
function clearStorage() {
    localStorage.removeItem(cval_storageName);
    localStorage.removeItem(cval_storageNameLang);
}

