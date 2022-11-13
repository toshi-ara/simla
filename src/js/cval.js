// parameters of drugs
const
    cval_MU0 = [[75, 5], [67, 5], [52, 4], [34, 7]],
    cval_LOG_SIGMA0 = [[2.2, 0.4], [2.4, 0.4], [2.4, 0.4], [2.5, 0.5]],
    cval_ADR = 0.665,
    cval_MU0_adj = 0,
    cval_D_MU0 = [0, 4]

// image
const cval_path_to_fig = "./fig/fig_back.png";
const
    cval_CENTERS = [[218, 100], [289, 100], [360, 100],
               [218, 150], [289, 150], [360, 150]],
    cval_Rnormal = 20, cval_RnormalCenter = 3,
    cval_Rrespond =18, cval_RrespondCenter = 2

// threshold of probability not to respond
const cval_ProbThreshold = 0.05

// name of local strage
const cval_storageName = "simlationLocalAnesthesia"
const cval_storageNameLang = "simlationLocalAnesthesiaLang"
