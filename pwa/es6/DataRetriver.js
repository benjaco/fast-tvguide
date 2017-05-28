/**
 * Created by Benjamin on 27-05-2017.
 */
function param(a) {
    var s = [], rbracket = /\[\]$/,
        isArray = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }, add = function (k, v) {
            v = typeof v === 'function' ? v() : v === null ? '' : v === undefined ? '' : v;
            s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
        }, buildParams = function (prefix, obj) {
            var i, len, key;

            if (prefix) {
                if (isArray(obj)) {
                    for (i = 0, len = obj.length; i < len; i++) {
                        if (rbracket.test(prefix)) {
                            add(prefix, obj[i]);
                        } else {
                            buildParams(prefix + '[' + (typeof obj[i] === 'object' ? i : '') + ']', obj[i]);
                        }
                    }
                } else if (obj && String(obj) === '[object Object]') {
                    for (key in obj) {
                        buildParams(prefix + '[' + key + ']', obj[key]);
                    }
                } else {
                    add(prefix, obj);
                }
            } else if (isArray(obj)) {
                for (i = 0, len = obj.length; i < len; i++) {
                    add(obj[i].name, obj[i].value);
                }
            } else {
                for (key in obj) {
                    buildParams(key, obj[key]);
                }
            }
            return s;
        };

    return buildParams('', a).join('&').replace(/%20/g, '+');
}

export default class DataRetriver {

    static get(day, channels) {
        return this.openDatabase() // open the index db database, set it op if it isn't
            .then(idb => {
                return DataRetriver.getFromIDB(day, channels, idb).then(data => {
                    // if the data is found, return it
                    return Promise.resolve([data.data, "cache"])
                }).catch(_ => {

                    let url = "../server/get_overview.php?" + param({
                            channels: channels,
                            dates: [day]
                        });

                    // else get the tvguide fom the server
                    return fetch(url)
                        .then(r => r.json())
                        .then(data => {
                            // and cache it before returning it
                            DataRetriver.store(day, channels, data, idb);

                            return Promise.resolve([data, "network"])
                        });
                })
            })
    }

    static openDatabase() {
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

    static store(day, channels, data, idb) {
        const transaction = idb.transaction("channels", "readwrite");
        const objstore = transaction.objectStore("channels");
        objstore.put({
            data,
            name: day + "-" + channels.join(",")
        })
    }

    static getFromIDB(day, channels, idb) {
        return new Promise((resolve, reject) => {
            let name = day + "-" + channels.join(",");

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

    static getAllSavedDays(idb) {
        return new Promise((resolve, reject) => {

            const transaction = idb.transaction("channels");
            const objstore = transaction.objectStore("channels");
            let keys = objstore.getAllKeys();
            keys.onsuccess = (event) => {
                resolve(keys.result)

            };
        })

    }
}