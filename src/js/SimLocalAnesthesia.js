import * as cval from "./cval.js";
import * as labels from "./labels.js";
import * as func from "./functions.js";

export default class SimLocalAnesthesia {
    time;
    lang;
    param;
    elem;

    constructor() {
        // object for timer
        this.time = {
            isRunning:  false,
            start:   Date.now(),
            elapsed: 0,
            total:   0
        }

        // object for EventListner
        this.elem = {};
        this.elem.lang = document.getElementById("lang");
        this.elem.newexp = document.getElementById("newexp");
        this.elem.start = document.getElementById("start");
        this.elem.quit = document.getElementById("quit");
        this.elem.slider = document.getElementById("slider");
        this.elem.speed_msg = document.getElementById("speed_msg");
        this.elem.timer = document.getElementById("timer");
        this.elem.canvas = document.getElementById("canvas");
        this.elem.response = document.getElementById("response");

        // set canvas
        const context = this.elem.canvas.getContext("2d");
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

        // PC or tablet
        const clickEventType = (window.ontouchstart === undefined) ? "mousedown" : "touchstart";

        // add EventListener to buttons, slider, timer and canvas
        this.elem.newexp.addEventListener(clickEventType,
            this.clickNewExp.bind(this), false);
        this.elem.start.addEventListener(clickEventType,
            this.clickStart.bind(this), false);
        this.elem.quit.addEventListener(clickEventType,
            this.clickQuit.bind(this), false);
        this.elem.canvas.addEventListener(clickEventType,
            (e) => {this.clickCanvas(this.elem.canvas, context, e)}, false);
        this.elem.slider.addEventListener("input",
            this.sliderChanged.bind(this), false);
        this.elem.lang.addEventListener("change",
            this.toggleLang.bind(this), false);


        // parameters of drugs for each individual
        this.param = func.setInitParameter(cval.MU0, cval.LOG_SIGMA0, cval.ADR, cval.MU0_adj, cval.D_MU0);
        this.lang = 0;

        // restore parameters if data is saved in localStorage
        const storage = this.getStorage();
        if (Object.keys(storage).length > 0) {
            this.time = storage.time;
            slider.value = storage.speed;
            this.param = storage.param;
        }

        // process in reload of browser
        this.lang = this.getStorageLang();
        this.elem.lang.la[this.lang].checked = true;
        this.setLang(this.lang);

        // change buttons status
        this.toggleButton(this.time.isRunning);

        // display timer
        this.elem.timer.textContent = this.timeFormat(0);
    }

    start() {
        // display timer
        this.displayTimer();
    }

    //////////////////////////////////////////////////////////////////
    // Methods
    //////////////////////////////////////////////////////////////////

    //////////////////////////////////
    // mousedown in canvas area
    //////////////////////////////////
     clickCanvas(canvas, context, e) {
        if (!this.time.isRunning) { return }
        // running
        const pos = func.getClickedPosition(canvas, e);
        const site = func.getCircleNumber(pos, cval.CENTERS, cval.Rnormal);

        if (site < 0) { return }
        // when clicked in circles
        const Time = (this.time.total + this.time.elapsed) / 60000; // (min)
        const isResponse = func.getResponse(site, Time, this.param);

        if (isResponse) {
            // effects with response
            func.fillRect(context, cval.CENTERS[site], cval.Rrespond);
            func.drawCircle(context, cval.CENTERS[site],
                            cval.Rrespond, cval.RrespondCenter, "red");
            this.elem.response.textContent = labels.with_response[this.lang];
            this.elem.response.style.color = "red";

            setTimeout(function() {
                func.fillRect(context, cval.CENTERS[site], cval.Rrespond);
                func.drawCircle(context, cval.CENTERS[site],
                                cval.Rnormal, cval.RnormalCenter, "black");
                this.elem.response.textContent = "";
            }.bind(this), 300);
        } else {
            // effects without response
            this.elem.response.textContent = labels.without_response[this.lang];
            this.elem.response.style.color = "black";
            setTimeout(function() {
                this.elem.response.textContent = "";
            }.bind(this), 300);
        }
    }

    //////////////////////////////////
    // buttons
    //////////////////////////////////
    // redraw buttons in each language
    toggleLang() {
        this.lang = this.elem.lang.elements.la.value;
        this.setLang(this.lang)
        this.setStorageLang()
    }

    setLang(lang) {
        // start/restart/pause button
        let lab;
        if (this.time.isRunning) {
            lab = labels.pause;
        } else {
            if (this.time.total == 0) {
                lab = labels.start;
            } else {
                lab = labels.restart;
            }
        }
        this.elem.start.textContent = lab[lang];
        this.elem.newexp.textContent = labels.newexp[lang];
        this.elem.quit.textContent = labels.quit[lang];
        this.toggleButton(this.time.isRunning);

        // slider
        this.printSpeed(slider.value)
    }

    // push new experiment button
     clickNewExp() {
        if (this.time.isRunning) { return }
        // in pause
        const check = window.confirm(labels.msg_newexp[this.lang]);
        if (check) {
            this.time.isRunning = false;
            this.time.start = Date.now();
            this.time.elapsed = 0;
            this.time.total = 0;
            this.param = func.setInitParameter(cval.MU0, cval.LOG_SIGMA0, cval.ADR, cval.MU0_adj, cval.D_MU0);
            slider.value = 1;
            this.setStorage();
            this.setLang(this.lang)
        }
    }

    // push start/restart/pause button
    clickStart() {
        if (!this.time.isRunning) { // before start / in pause
            this.time.isRunning = true;          // running
            this.time.start = Date.now();
            this.time.elapsed = 0;
            this.setLang(this.lang)
            this.toggleButton(true);
        }
        else { // in running
            this.time.isRunning = false;         // pause
            this.time.total += this.time.elapsed;
            this.setLang(this.lang)
            this.toggleButton(false);
        }
        this.setStorage();
    }

    // push quit button
    clickQuit() {
        if (this.time.isRunning) { return }
        // in pause
        const check = window.confirm(labels.msg_quit[this.lang]);
        if (check) {
            this.clearStorage();
            this.clearStorageLang();
            window.alert(labels.msg_close[this.lang]);
        }
    }

    toggleButton(isRunning) {
        if (isRunning) {
            this.elem.newexp.style.color = "gray";
            this.elem.quit.style.color = "gray";
        } else {
            this.elem.newexp.style.color = "black";
            this.elem.quit.style.color = "black";
        }
    }

    //////////////////////////////////
    // change slider
    //////////////////////////////////
    sliderChanged() {
        this.printSpeed(slider.value)
        if (this.time.isRunning) {
            this.time.total += this.time.elapsed;
            this.time.start = Date.now();
            this.time.elapsed = 0;
        }
        this.setStorage();
    }

    printSpeed(speed) {
        this.elem.speed_msg.textContent = speed + labels.speed[this.lang];
    }

    //////////////////////////////////
    // timer
    //////////////////////////////////
    // display timer
     displayTimer() {
        let t;
        if (this.time.isRunning) {
            this.time.elapsed = (Date.now() - this.time.start) * this.elem.slider.value;
            t = this.time.total + this.time.elapsed;
        } else {
            t = this.time.total;
        }
        this.elem.timer.textContent = this.timeFormat(t);
        requestAnimationFrame(this.displayTimer.bind(this));
    }

     timeFormat(t) {
        return Math.floor(t / 36e5) + new Date(t).toISOString().slice(13, 19);
    }

    //////////////////////////////////
    // localStrage
    //////////////////////////////////
    // save data to localStorage
     setStorage() {
        localStorage.setItem(cval.storageName, JSON.stringify({
            time:  this.time,
            speed: slider.value,
            param: this.param
        }));
    }

    // get data in localStorage
     getStorage() {
        const params = localStorage.getItem(cval.storageName);
        return params ? JSON.parse(params) : {};
    }

    // save data to localStorage (lang)
     setStorageLang() {
        localStorage.setItem(cval.storageNameLang, this.lang)
    }

    // get data in localStorage (lang)
     getStorageLang() {
        const lang = localStorage.getItem(cval.storageNameLang);
        return lang ? lang: 0
    }

    // delete data in localStorage
     clearStorage() {
        localStorage.removeItem(cval.storageName);
        localStorage.removeItem(cval.storageNameLang);
    }
}

