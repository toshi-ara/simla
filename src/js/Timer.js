class Timer {
    constructor() {
        this._isRunning = false;
        this._start = Date.now();
        this._elapsed = 0;
        this._total = 0;
        this.storageName = "SimLaTime";

        // restore parameters if data is saved in localStorage
        const storage = this.getStorage();
        if (Object.keys(storage).length > 0) {
            this._isRunning = storage.isRunning;
            this._start = storage.start;
            this._elapsed = storage.elapsed;
            this._total = storage.total;
        }
    }

    get isRunning() {
        return this._isRunning;
    }

    get getMinute() {
        return (this._total + this._elapsed) / 60000;
    }

    get getTotalTime() {
        return this._total;
    }

    getTimeStr(speed) {
        return this.timeFormat(this.getTime(speed));
    }

    getTime(speed) {
        let t;
        if (this.isRunning) {
            this._elapsed = (Date.now() - this._start) * speed;
            t = this._total + this._elapsed;
        } else {
            t = this._total;
        }
        return t;
    }

    timeFormat(t) {
        return Math.floor(t / 36e5) + new Date(t).toISOString().slice(13, 19);
    }

    //////////////////////////////////
    // push buttons / change slider
    //////////////////////////////////
    // push new experiment button
    clickNewExp() {
        if (!this.isRunning) {
            this._isRunning = false;
            this._start = Date.now();
            this._elapsed = 0;
            this._total = 0;
            this.setStorage();
        }
    };

    // push start/restart/pause button
    clickStart() {
        if (!this.isRunning) { // before start / in pause
            this._isRunning = true;   // running
            this._start = Date.now();
            this._elapsed = 0;
        }
        else { // in running
            this._isRunning = false;  // pause
            this._total += this._elapsed;
        }
        this.setStorage();
    }

    // push quit button
    clickQuit() {
        if (!this.isRunning) {
            this._isRunning = false;
            this._start = Date.now();
            this._elapsed = 0;
            this._total = 0;
            this.clearStorage();
        }
    }

    // change slider
    sliderChanged() {
        if (this.isRunning) {
            this._total += this._elapsed;
            this._start = Date.now();
            this._elapsed = 0;
            this.setStorage();
        }
    }

    //////////////////////////////////
    // localStrage
    //////////////////////////////////
    // save data to localStorage
    setStorage() {
        localStorage.setItem(this.storageName, JSON.stringify({
            isRunning: this._isRunning,
            start: this._start,
            elapsed: this._elapsed,
            total: this._total
        }));
    }

    // get data in localStorage
    getStorage() {
        const params = localStorage.getItem(this.storageName);
        return params ? JSON.parse(params) : {};
    }

    // delete data in localStorage
    clearStorage() {
        localStorage.removeItem(this.storageName);
    }
}

