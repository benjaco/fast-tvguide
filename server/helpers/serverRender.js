const {Worker} = require('worker_threads');

class ServerRender {
    constructor() {
        this.template = "";
        this.renderedPhonePage = null;
        this.renderedDesktopPage = null;
        this.phonePageMissingDiagrams = {};

        this.dataRetriever = (channels, dates) => {
            return {}
        };

        this.setTemplate = this.setTemplate.bind(this);
        this.setData = this.setData.bind(this);
        this.triggerRender = this.triggerRender.bind(this);

        this.worker = new Worker(__dirname + "/serverRenderWorker.js");
        this.worker.on("message", tasks => {
            for (let task of tasks) {
                switch (task.name) {
                    case "getData":
                        this.worker.postMessage([{
                            ...task,
                            data: this.dataRetriever(task.data.channels, task.data.dates)
                        }]);
                        break;

                    case "rendered":
                        this.renderedPhonePage = task.data.renderedPhonePage;

                        this.phonePageMissingDiagrams[task.data.phoneRenderingKey] = task.data.phonePageMissingDiagrams;

                        // only keep the 2 newest items
                        let allKeys = Object.keys(this.phonePageMissingDiagrams);
                        allKeys
                            .sort((a, b) => parseInt(b) - parseInt(a))
                            .splice(2)
                            .forEach(key => delete this.phonePageMissingDiagrams[key]);


                        this.renderedDesktopPage = task.data.renderedDesktopPage;
                        console.log("data rendered");
                        break;
                }
            }
        });
    }

    setTemplate(template) {
        this.template = template;

        if (this.renderedDesktopPage === null || this.renderedPhonePage === null) {
            this.renderedPhonePage = template;
            this.renderedDesktopPage = template;
        }

        this.worker.postMessage([{
            name: "setTemplate",
            data: template
        }, {
            name: "render"
        }]);
    }

    setData(data, key = false){
        this.worker.postMessage([{
            name: "setData",
            data: {
                programData: data,
                key
            }
        }, {
            name: "render"
        }]);
    }

    /**
     * Data is only updated if date has changed, else only update timeline
     */
    triggerRender() {
        this.worker.postMessage([{
            name: "render"
        }]);
    }


}

module.exports = new ServerRender();