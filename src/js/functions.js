import * as cval from "./cval.js";

//////////////////////////////////
// statistical functions
//////////////////////////////////

// logistic function
// function inv_logit(x) {
//     return 1 / (1 + Math.exp(-x))
// }

function inv_logit_upper(x) {
  return 1 / (1 + Math.exp(x))
}


// approximate phi function
// function phi_approx(x) {
//     return inv_logit(0.07056 * Math.pow(x, 3) + 1.5976 * x)
// }

function phi_approx_upper(x) {
    return inv_logit_upper(0.07056 * Math.pow(x, 3) + 1.5976 * x)
}

// Random generation according to standard normal distribution
// https://stabucky.com/wp/archives/9263
function random_norm(mu = 0, sd = 1) {
    let s = 0;
    for (let i = 0; i < 12; i++) {
        s += Math.random();
    }
    return (s - 6) * sd + mu;
}



//////////////////////////////////
// function for setting of parameter
//////////////////////////////////

// Initial setting of parameters
export function setInitParameter(mu0, log_sigma0, adr, mu_adj, d_mu0) {
    const n = 6;
    let param = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
    // individual difference
    const d = mu_adj + random_norm(d_mu0[0], d_mu0[1]);

    // values of saline are 0
    // set parameters for Pro, Lid, Mep, Bup with random generator
    for (let i = 1; i < n - 1; i++) {
        param[i][0] = random_norm(mu0[i-1][0] + d, mu0[i-1][1]);
        param[i][1] = Math.exp(random_norm(log_sigma0[i-1][0], log_sigma0[i-1][1]));
    }
    // Lid + Adr
    param[n-1][0] = param[2][0]
    param[n-1][1] = param[2][1]
    param[n-1][2] = adr

    return param
}



//////////////////////////////////
// function for drawing
//////////////////////////////////

// Draw circle
export function drawCircle(context, center, radiusOuter, radiusInner, color) {
    // outer
    context.beginPath();
    context.arc(center[0], center[1], radiusOuter, 0, Math.PI * 2, true);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    context.beginPath();
    context.arc(center[0], center[1], radiusInner, 0, Math.PI * 2, false);
    context.fillStyle = color;
    context.fill();
    context.closePath();
};


// Fill region in canvas
export function fillRect(context, center, radius) {
    const r = radius * 1.3;
    context.fillStyle = "#f4d7d7";
    context.fillRect(center[0] - r, center[1] - r, r * 2, r * 2)
};


//////////////////////////////////
// function for simulation
//////////////////////////////////

// Get position in canvas
//
// Args:
//   canvas
//   e
// Return: [int:x, int:y]
export function getClickedPosition(canvas, e) {
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
export function isInCircle(position, center, radius) {
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
export function getCircleNumber(position, centers, radius) {
    var result = -1;
    for (let i = 0; i < centers.length; i++) {
        if (isInCircle(position, centers[i], radius)) {
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
function getProbability(time, param) {
    var X = 100 - (1 - param[2]) * time;
    return phi_approx_upper((X - param[0]) / param[1])
}


// Return "respond / not respond" with random number
//   from time (min) and parameters
//
// Args
//   number: kind of drug (integer)
//   time:  minute
//   param[mu, sigma, adr]
// Return: true/false
export function getResponse(number, time, param) {
    let prob;
    if (number == 0) {
        // saline
        prob = 0.99;
    } else {
        prob = getProbability(time, param[number]);
        // not respond when probability is less than threshold
        if (prob < cval.ProbThreshold) {
            return false
        }
    }
    // return respond / not respond with random number
    //   under calculated probability
    return Math.random() <= prob
}

