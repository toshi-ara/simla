// parameters of drugs
const
    MU0 = [[75, 5], [67, 5], [52, 4], [34, 7]],
    LOG_SIGMA0 = [[2.2, 0.4], [2.4, 0.4], [2.4, 0.4], [2.5, 0.5]],
    ADR = 0.665,
    MU0_adj = 0,
    D_MU0 = [0, 4]

// image
const path_to_fig = "./fig/fig_back.png"
const
    CENTERS = [[218, 100], [289, 100], [360, 100],
               [218, 150], [289, 150], [360, 150]],
    Rnormal = 20, RnormalCenter = 3,
    Rrespond =18, RrespondCenter = 2

// threshold of probability not to respond
const ProbThreshold = 0.05

// name of local strage
const storageName = "simlationLocalAnesthesia"

