class ConstVal {
    // parameters of drugs
    static MU0 = [[75, 8], [67, 5], [43, 6], [30, 10]];
    static LOG_SIGMA0 = [[2.2, 0.4], [2.4, 0.4], [2.4, 0.4], [2.5, 0.5]];
    static ADR = 0.7;
    static MU0_adj = 0;
    static D_MU0 = [0, 4];

    // image
    static path_to_fig = "./fig/fig_back.png";
    static CENTERS = [[218, 100], [289, 100], [360, 100],
                      [218, 150], [289, 150], [360, 150]];
    static Rnormal = 20;
    static RnormalCenter = 3;
    static Rrespond = 18;
    static RrespondCenter = 2;

    // threshold of probability not to respond
    static ProbThreshold = 0.05;

    // name of local strage
    static storageNameSpeed = "SimLaSpeed";
    static storageNameLang = "SimLaLang";
}

