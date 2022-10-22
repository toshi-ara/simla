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


// labels
const
    label_start = "開始",
    label_restart = "再開",
    label_pause = "一時停止",
    label_newexp = "新規実験",
    label_quit = "終了",
    label_with_response = "反応あり",
    label_without_response = "反応なし",
    label_speed = "倍速";
const
    msg_newexp = "新規実験を行いますか?",
    msg_quit = "終了しますか?",
    msg_close = "ブラウザあるいはこのタブを閉じて下さい";

// const
//     label_start = "Start",
//     label_restart = "Restart",
//     label_pause = "Pause",
//     label_newexp = "New Exp.",
//     label_quit = "Quit",
//     label_with_response = "Respond",
//     label_without_response = "Not Respond",
//     label_speed = "x speed";
// const
//     msg_newexp = "Do you want to start a new experiment?",
//     msg_quit = "Do you want to quit?",
//     msg_close = "Please close the browser or this tab";

