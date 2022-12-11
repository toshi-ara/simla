class SimLocalAnesthesia {
    lang;
    time;
    param;
    elem;

    constructor() {
        this.time = new Timer();
        this.param = new Parameter();

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

        // draw circles
        ConstVal.CENTERS.forEach(function(center) {
            Draw.drawCircle(context, center,
                            ConstVal.Rnormal, ConstVal.RnormalCenter, "black")
        });

        // PC or tablet
        const clickEventType = (window.ontouchstart === undefined) ? "mousedown" : "touchstart";

        // add EventListener to buttons, slider, timer and canvas
        this.elem.newexp.addEventListener(clickEventType,
            () => {this.clickNewExp()}, false);
        this.elem.start.addEventListener(clickEventType,
            () => {this.clickStart()}, false);
        this.elem.quit.addEventListener(clickEventType,
            () => {this.clickQuit()}, false);
        this.elem.canvas.addEventListener(clickEventType,
            (e) => {this.clickCanvas(this.elem.canvas, context, e)}, false);
        this.elem.slider.addEventListener("input",
            () => {this.sliderChanged()}, false);
        this.elem.lang.addEventListener("change",
            () => {this.toggleLang()}, false);

        // process in reload of browser
        // restore parameters if data is saved in localStorage
        const storage = this.getStorageSpeed();
        if (Object.keys(storage).length > 0) {
            slider.value = storage.speed;
        }

        this.lang = this.getStorageLang();
        this.elem.lang.la[this.lang].checked = true;
        this.setLang();

        // change buttons status
        this.toggleButton();

        // display timer
        this.elem.timer.textContent = "0:00:00"
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
        const pos = this.getClickedPosition(canvas, e);
        const site = this.getCircleNumber(pos, ConstVal.CENTERS, ConstVal.Rnormal);

        if (site < 0) { return }
        // when clicked in circles
        const isResponse = this.getResponse(site, this.time.getMinute,
                                            this.param.getParameter());

        if (isResponse) {
            // effects with response
            Draw.fillRect(context, ConstVal.CENTERS[site], ConstVal.Rrespond);
            Draw.drawCircle(context, ConstVal.CENTERS[site],
                            ConstVal.Rrespond, ConstVal.RrespondCenter, "red");
            this.elem.response.textContent = Labels.with_response[this.lang];
            this.elem.response.style.color = "red";

            setTimeout(() => {
                Draw.fillRect(context, ConstVal.CENTERS[site], ConstVal.Rrespond);
                Draw.drawCircle(context, ConstVal.CENTERS[site],
                                ConstVal.Rnormal, ConstVal.RnormalCenter, "black");
                this.elem.response.textContent = "";
            }, 300);
        } else {
            // effects without response
            this.elem.response.textContent = Labels.without_response[this.lang];
            this.elem.response.style.color = "black";
            setTimeout(() =>  {
                this.elem.response.textContent = "";
            }, 300);
        }
    }

    //////////////////////////////////
    // buttons
    //////////////////////////////////
    // redraw buttons in each language
    toggleLang() {
        this.lang = this.elem.lang.elements.la.value;
        this.setLang()
        this.setStorageLang()
    }

    setLang() {
        // start/restart/pause button
        let lab;
        if (this.time.isRunning) {
            lab = Labels.pause;
        } else {
            if (this.time.getTotalTime == 0) {
                lab = Labels.start;
            } else {
                lab = Labels.restart;
            }
        }
        this.elem.start.textContent = lab[this.lang];
        this.elem.newexp.textContent = Labels.newexp[this.lang];
        this.elem.quit.textContent = Labels.quit[this.lang];
        this.toggleButton();

        // slider
        this.printSpeed(slider.value)
    }

    // push new experiment button
    clickNewExp() {
        if (this.time.isRunning) { return }
        // in pause
        const check = window.confirm(Labels.msg_newexp[this.lang]);
        if (check) {
            this.time.clickNewExp();
            this.param.setInitParameter();
            slider.value = 1;
            this.setStorageSpeed();
            this.setLang()
        }
    }

    // push start/restart/pause button
    clickStart() {
        this.param = new Parameter();
        this.time.clickStart();
        this.setLang()
        this.toggleButton();
        this.setStorageSpeed();
    }

    // push quit button
    clickQuit() {
        if (this.time.isRunning) { return }
        // in pause
        const check = window.confirm(Labels.msg_quit[this.lang]);
        if (check) {
            window.alert(Labels.msg_close[this.lang]);
            this.elem.start.textContent = Labels.start[this.lang];
            this.time.clickQuit();
            this.param.clearStorage();
            this.clearStorage();
        }
    }

    toggleButton() {
        if (this.time.isRunning) {
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
        this.time.sliderChanged();
        this.setStorageSpeed();
    }

    printSpeed(speed) {
        this.elem.speed_msg.textContent = speed + Labels.speed[this.lang];
    }

    //////////////////////////////////
    // function for simulation
    //////////////////////////////////
    // Get position in canvas
    //
    // Args:
    //   canvas
    //   e
    // Return: [int:x, int:y]
    getClickedPosition(canvas, e) {
        let touch;
        const borderWidth = 0;

        // get clicked position
        if (window.ontouchstart === undefined) {
            // PC (mousedown)
            touch = e;
        } else {
            // smartphone/tablet (touchstart)
            touch = e.touches[0] || e.changedTouches[0];
        }
        const rect = e.target.getBoundingClientRect();

        const x = touch.clientX - rect.left - borderWidth;
        const y = touch.clientY - rect.top - borderWidth;

        // ratio of display size and real size of canvas
        const scaleWidth = canvas.clientWidth / canvas.width;
        const scaleHeight = canvas.clientHeight / canvas.height;
        // convert position in browser to that in canvas
        const canvasX = Math.floor(x / scaleWidth);
        const canvasY = Math.floor(y / scaleHeight);

        return [canvasX, canvasY]
    }

    // Return whether position is present in circle
    //
    // Args:
    //   position: position of mouse click
    //   center: position of center of circle
    //   radius:
    // Return: true/false
    isInCircle(position, center, radius) {
        const l2 = Math.pow(position[0] - center[0], 2) +
                   Math.pow(position[1] - center[1], 2);
        return l2 <= Math.pow(radius, 2);
    }

    // Return the number which circle coordinate is present
    //
    // Args:
    //   centers: 2D-array of coordinates of the center of the circle
    //   radius
    // Return: circle number
    //   (return -1 when coordinate is out of circles)
    getCircleNumber(position, centers, radius) {
        let result = -1;
        for (let i = 0; i < centers.length; i++) {
            if (this.isInCircle(position, centers[i], radius)) {
                result = i
            }
        }
        return result
    }

    // Return probability to respond from time (min) and parameters
    //
    // Args:
    //   time (min)
    //   param[mu, sigma, adr]
    // Return: probability (0-1)
    getProbability(time, param) {
        let X = 100 - (1 - param[2]) * time;
        return MyStat.phi_approx_upper((X - param[0]) / param[1])
    }

    // Return "respond / not respond" with random number
    //   from time (min) and parameters
    //
    // Args
    //   number: kind of drug (integer)
    //   time:  minute
    //   param[mu, sigma, adr]
    // Return: true/false
    getResponse(number, time, param) {
        let prob;
        if (number == 0) {
            // saline
            prob = 0.99;
        } else {
            prob = this.getProbability(time, param[number]);
            // not respond when probability is less than threshold
            if (prob < ConstVal.ProbThreshold) {
                return false
            }
        }
        // return respond / not respond with random number
        //   under calculated probability
        return Math.random() <= prob
    }

    //////////////////////////////////
    // timer
    //////////////////////////////////
    // display timer
    displayTimer() {
        this.elem.timer.textContent = this.time.getTimeStr(slider.value);
        requestAnimationFrame(() => {this.displayTimer()});
    }

    //////////////////////////////////
    // localStrage
    //////////////////////////////////
    // save data to localStorage
    setStorageSpeed() {
        localStorage.setItem(ConstVal.storageNameSpeed, JSON.stringify({
            speed: slider.value,
        }));
    }

    // get data in localStorage
    getStorageSpeed() {
        const params = localStorage.getItem(ConstVal.storageNameSpeed);
        return params ? JSON.parse(params) : {};
    }

    // save data to localStorage (lang)
    setStorageLang() {
        localStorage.setItem(ConstVal.storageNameLang, this.lang)
    }

    // get data in localStorage (lang)
    getStorageLang() {
        const lang = localStorage.getItem(ConstVal.storageNameLang);
        return lang ? lang : 0
    }

    // delete data in localStorage
    clearStorage() {
        localStorage.removeItem(ConstVal.storageNameSpeed);
        localStorage.removeItem(ConstVal.storageNameLang);
    }
}

