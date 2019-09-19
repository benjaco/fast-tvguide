const {Worker} = require('worker_threads');
const GetImages = require('../getChannelImages');

class DataUpdater {
    constructor() {
        this.fetchData = this.fetchData.bind(this);
        this.fetchImages = this.fetchImages.bind(this);
        this.init = this.init.bind(this);
        this.dataChange = () => {
        };


        this.worker = new Worker(__dirname + "/dataUpdaterWorker.js");
        this.worker.on("message", tasks => {
            for (let task of tasks) {
                switch (task.name) {
                    case "update":
                        this.dataChange();
                        break;
                }
            }
        });

    }

    init() {
        this.fetchImages();
        this.fetchData();

        setInterval(this.fetchData, 1000 * 60 * 60 * 6);
    }

    async fetchData(){
        this.worker.postMessage([{
            name: "fetchData"
        }]);
    }
    async fetchImages(){
        await GetImages();
    }
}

module.exports = new DataUpdater();