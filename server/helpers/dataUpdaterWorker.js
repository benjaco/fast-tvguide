const {parentPort} = require('worker_threads');
const GetProgramguide = require('../getProgramdata');


function updateMainThread() {
    parentPort.postMessage([{
        name: "update"
    }]);
}

async function fetchData() {
    let updated = await GetProgramguide();
    if (updated) {
        updateMainThread();
    }
}


parentPort.on("message", tasks => {
    for (let task of tasks) {
        switch (task.name) {
            case "fetchData":
                fetchData();
                break;

        }
    }
});


