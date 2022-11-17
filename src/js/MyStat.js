//////////////////////////////////
// statistical functions
//////////////////////////////////

class MyStat {
    // logistic function
    static inv_logit(x) {
        return 1 / (1 + Math.exp(-x))
    }

    static inv_logit_upper(x) {
      return 1 / (1 + Math.exp(x))
    }

    // approximate phi function
    static phi_approx(x) {
        return this.inv_logit(0.07056 * Math.pow(x, 3) + 1.5976 * x)
    }

    static phi_approx_upper(x) {
        return this.inv_logit_upper(0.07056 * Math.pow(x, 3) + 1.5976 * x)
    }

    // Random generation according to standard normal distribution
    // https://stabucky.com/wp/archives/9263
    static random_norm(mu = 0, sd = 1) {
        let s = 0;
        for (let i = 0; i < 12; i++) {
            s += Math.random();
        }
        return (s - 6) * sd + mu;
    }
}

