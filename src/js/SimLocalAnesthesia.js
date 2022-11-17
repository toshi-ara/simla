class SimLocalAnesthesia {
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
        img.src = cval_path_to_fig;
        img.onload = () => {
            // display image
            context.drawImage(img, 0, 0);
            // draw circles
            cval_CENTERS.forEach(function(center) {
                Draw.drawCircle(context, center,
                                cval_Rnormal, cval_RnormalCenter, "black")
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
        this.param = this.setInitParameter(cval_MU0, cval_LOG_SIGMA0, cval_ADR, cval_MU0_adj, cval_D_MU0);
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
    // setting of initial parameter
    //////////////////////////////////
    setInitParameter(mu0, log_sigma0, adr, mu_adj, d_mu0) {
        const n = 6;
        let param = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
        // individual difference
        const d = mu_adj + MyStat.random_norm(d_mu0[0], d_mu0[1]);

        // values of saline are 0
        // set parameters for Pro, Lid, Mep, Bup with random generator
        for (let i = 1; i < n - 1; i++) {
            param[i][0] = MyStat.random_norm(mu0[i-1][0] + d, mu0[i-1][1]);
            param[i][1] = Math.exp(MyStat.random_norm(log_sigma0[i-1][0], log_sigma0[i-1][1]));
        }
        // Lid + Adr
        param[n-1][0] = param[2][0]
        param[n-1][1] = param[2][1]
        param[n-1][2] = adr

        return param
    }

    //////////////////////////////////
    // mousedown in canvas area
    //////////////////////////////////
     clickCanvas(canvas, context, e) {
        if (!this.time.isRunning) { return }
        // running
        const pos = this.getClickedPosition(canvas, e);
        const site = this.getCircleNumber(pos, cval_CENTERS, cval_Rnormal);

        if (site < 0) { return }
        // when clicked in circles
        const Time = (this.time.total + this.time.elapsed) / 60000; // (min)
        const isResponse = this.getResponse(site, Time, this.param);

        if (isResponse) {
            // effects with response
            Draw.fillRect(context, cval_CENTERS[site], cval_Rrespond);
            Draw.drawCircle(context, cval_CENTERS[site],
                            cval_Rrespond, cval_RrespondCenter, "red");
            this.elem.response.textContent = labels_with_response[this.lang];
            this.elem.response.style.color = "red";

            setTimeout(function() {
                Draw.fillRect(context, cval_CENTERS[site], cval_Rrespond);
                Draw.drawCircle(context, cval_CENTERS[site],
                                cval_Rnormal, cval_RnormalCenter, "black");
                this.elem.response.textContent = "";
            }.bind(this), 300);
        } else {
            // effects without response
            this.elem.response.textContent = labels_without_response[this.lang];
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
            lab = labels_pause;
        } else {
            if (this.time.total == 0) {
                lab = labels_start;
            } else {
                lab = labels_restart;
            }
        }
        this.elem.start.textContent = lab[lang];
        this.elem.newexp.textContent = labels_newexp[lang];
        this.elem.quit.textContent = labels_quit[lang];
        this.toggleButton(this.time.isRunning);

        // slider
        this.printSpeed(slider.value)
    }

    // push new experiment button
     clickNewExp() {
        if (this.time.isRunning) { return }
        // in pause
        const check = window.confirm(labels_msg_newexp[this.lang]);
        if (check) {
            this.time.isRunning = false;
            this.time.start = Date.now();
            this.time.elapsed = 0;
            this.time.total = 0;
            this.param = this.setInitParameter(cval_MU0, cval_LOG_SIGMA0, cval_ADR, cval_MU0_adj, cval_D_MU0);
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
        const check = window.confirm(labels_msg_quit[this.lang]);
        if (check) {
            this.clearStorage();
            this.clearStorageLang();
            window.alert(labels_msg_close[this.lang]);
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
        this.elem.speed_msg.textContent = speed + labels_speed[this.lang];
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
        var l2 = Math.pow(position[0] - center[0], 2) +
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
        var result = -1;
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
        var X = 100 - (1 - param[2]) * time;
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
            if (prob < cval_ProbThreshold) {
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
        localStorage.setItem(cval_storageName, JSON.stringify({
            time:  this.time,
            speed: slider.value,
            param: this.param
        }));
    }

    // get data in localStorage
     getStorage() {
        const params = localStorage.getItem(cval_storageName);
        return params ? JSON.parse(params) : {};
    }

    // save data to localStorage (lang)
     setStorageLang() {
        localStorage.setItem(cval_storageNameLang, this.lang)
    }

    // get data in localStorage (lang)
     getStorageLang() {
        const lang = localStorage.getItem(cval_storageNameLang);
        return lang ? lang: 0
    }

    // delete data in localStorage
     clearStorage() {
        localStorage.removeItem(cval_storageName);
        localStorage.removeItem(cval_storageNameLang);
    }
}

