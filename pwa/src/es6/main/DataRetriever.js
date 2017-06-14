/**
 * Created by Benjamin on 07-06-2017.
 */
import Param from "./Parameters"

export default class DataRetriever {


    constructor(app) {
        this._app = app;

        this.onCacheUpdate = () => {
        };

        this.get = this.get.bind(this);
        this.openDatabase = this.openDatabase.bind(this);
        this.store = this.store.bind(this);
        this.getFromIDB = this.getFromIDB.bind(this);
        this.getAllSavedDays = this.getAllSavedDays.bind(this);
        this.getDate = this.getDate.bind(this);
        this.getOldIndexes = this.getOldIndexes.bind(this);
        this.updateCache = this.updateCache.bind(this);
        this.cleanUp = this.cleanUp.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.getAllSavedData = this.getAllSavedData.bind(this);
        this.lastUpdatedForProgramScope = this.lastUpdatedForProgramScope.bind(this);

        this.fetchedCaches = []
    }

    fetchData(day, save, idb) {
        let channels = this._app.channelList.channels;

        let url = "../server/get_overview.php?" + Param({
                channels: channels,
                dates: [day]
            });

        return fetch(url)
            .then(r => r.json())
            .then(data => {
                // and cache it before returning it
                if (save) {
                    this.store(day, channels, data, idb);
                    this.fetchedCaches.push(url);
                }
                return Promise.resolve(data)
            })
    }

    get(day) {
        return this.openDatabase() // open the index db database, set it op if it isn't
            .then(idb => {
                return this.getFromIDB(day, this._app.channelList.channels, idb).then(data => {
                    // if the data is found, return it
                    return Promise.resolve([data.data, "cache"])
                }).catch(_ => {

                    // else get the tvguide from the server
                    return this.fetchData(day, true, idb).then(data => {
                        return Promise.resolve([data, "network"])
                    });
                })
            })
    }

    openDatabase() {
        let openDatabase = (name, version, upgrade) => {
            return new Promise((resolve, reject) => {

                const open = indexedDB.open(name, version);

                open.onsuccess = () => {
                    let db = open.result;
                    resolve(db);
                };

                open.onupgradeneeded = (index) => {
                    let db = open.result;
                    upgrade(db, index);
                };

                open.onerror = reject;
            })
        };

        return openDatabase("tv-guide-days", 1, (idb, version) => {
            switch (version.oldVersion) {
                case 0:
                    // console.log("CREATE OBJECT STORE");
                    idb.createObjectStore("channels", {keyPath: "name"});
            }
        });
    }

    store(day, channels, data, idb) {
        const transaction = idb.transaction("channels", "readwrite");
        const objstore = transaction.objectStore("channels");
        objstore.put({
            data,
            name: day + "/" + channels.join(","),
            savedDate: new Date()
        });
    }

    getFromIDB(day, channels, idb) {
        return new Promise((resolve, reject) => {
            let name = day + "/" + channels.join(",");

            let get = idb.transaction("channels").objectStore("channels").get(name);

            get.onsuccess = (event) => {
                if (typeof get.result === "undefined") {
                    reject();
                } else {
                    resolve(get.result)
                }
            };
            get.onerror = (event) => {
                reject()
            };
        })
    }

    getAllSavedDays(idb) {
        return new Promise((resolve, reject) => {

            const transaction = idb.transaction("channels");
            const objstore = transaction.objectStore("channels");
            let keys = objstore.getAllKeys();
            keys.onsuccess = (event) => {
                resolve(keys.result)

            };
        })
    }

    getDate() {
        let now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now
    }

    dateFromKey(key) {
        let keyparts = key.split("/");
        let keydate = keyparts[0].split("-");

        return new Date(keydate[0], parseInt(keydate[1]) - 1, keydate[2]);
    }

    getOldIndexes(indexes) {
        let yesterday = this.getDate();
        yesterday.setDate(yesterday.getDate() - 1);

        return indexes.filter(key => {
            return this.dateFromKey(key) < yesterday ||
                this._app.channelList.channels.join(",") !== key.split("/")[1];
        });
    }

    updateCache() {
        const formatCacheNames = (data) => {
            let result = [];

            for (let item of data) {
                result[item.name.split("/")[0]] = item.savedDate
            }

            return result;
        };

        this.openDatabase().then(idb => {
            this.cleanUp(idb);

            fetch("../server/data/last_update.json?"+Date.now())
                .then(lastUpdated => lastUpdated.json())
                .then(lastUpdated => {
                    let lastUpdatedForProgramScope = this.lastUpdatedForProgramScope(lastUpdated);

                    this.getAllSavedData(idb).then(savedDays => {
                        savedDays = formatCacheNames(savedDays);
                        let updateDays = [];

                        for(let {url: day} of this._app.week){
                            if( day in savedDays ) {
                                if( savedDays[day] < lastUpdatedForProgramScope[day] ) {
                                    updateDays.push(day);
                                }
                            }else{
                                updateDays.push(day);
                            }
                        }

                        for(let day of updateDays) {
                            this.fetchData(day, true, idb).then(data => this.onCacheUpdate(data))
                        }
                    })
                })

        })
    }

    cleanUp(idb) {
        this.getAllSavedDays(idb).then(keys => {
            let deleteIndexes = this.getOldIndexes(keys);

            const transaction = idb.transaction("channels", "readwrite");
            const objstore = transaction.objectStore("channels");

            for (let deleteIndex of deleteIndexes) {
                objstore.delete(deleteIndex);
            }
        })
    }

    getAllSavedData(idb) {
        return new Promise((resolve, reject) => {
            let objectStore = idb.transaction("channels").objectStore("channels");
            let data = objectStore.getAll();

            data.onsuccess = (event) => {
                resolve(data.result)
            };
        })
    }

    lastUpdatedForProgramScope(lastUpdated) {
        let result = [];

        for (let {url: day} of this._app.week) {
            result[day] = 0;

            for (let channel of this._app.channelList.channels) {
                result[day] = Math.max(result[day], lastUpdated[channel][day]);
            }
        }

        for(let key of Object.keys(result)){
            result[key] = new Date(result[key] * 1000)
        }

        return result;
    }
}