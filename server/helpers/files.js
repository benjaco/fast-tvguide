const fs = require('fs'),
    path = require('path'),
    fetch = require('node-fetch'),
    parseString = require('xml2js').parseString,
    moment = require('moment'),
    {promisify} = require('util');


function convertData(xmlData){
    let data = xmlData.tv.programme;
    
    data = data.map(i => {
        let d = {
            start: moment(i.$.start,"YYYYMMDDHHmmss ZZ").format("X"),
            stop: moment(i.$.stop,"YYYYMMDDHHmmss ZZ").format("X"),
        }
        for(let prop of Object.keys(i)){
            if(prop === "$"){
            } else if (prop === "credits"){
                let obj = {}
                for(let group of Object.keys(i[prop][0])){
                    obj[group] = i[prop][0][group].map(p => {
                        if(typeof p === "string"){
                            return {
                                "name": p
                            }
                        }
                        return {
                            "name": p._,
                            "role": p.$.role
                        }
                    })
                }
                d[prop] = obj;
            } else if(prop === "episode-num"){
                if(i[prop][0].$.system === "xmltv_ns"){
                    let fragments = i[prop][0]._.split(".")
                    let text = ""
                    if(fragments[1] != ""){
                        if(fragments[1].includes("/")){
                            let [episodeMinus1, episodeAll] = fragments[1].split("/").map(i => parseInt(i))
                            text += `Afsnit ${episodeMinus1+1} af ${episodeAll}`
                        }else{
                            let episodeMinus1 = parseInt(fragments[1])
                            text += `Afsnit ${episodeMinus1+1}`
                        }
                    }
                    if(fragments[0]){
                        if(fragments[0].includes("/")){
                            let [seasonMinus1, seasonAll] = fragments[0].split("/").map(i => parseInt(i))
                            text += `Afsnit ${seasonMinus1+1} af ${seasonAll}`
                        }else{
                            let seasonMinus1 = parseInt(fragments[0])
                            text += `Afsnit ${seasonMinus1+1}`
                        }
                    }


                    d["episodeNum"] = {
                        "xmltv_ns": i[prop][0]._,
                        onscreen: text
                    }
                }
            } else if(Array.isArray(i[prop])){
                let obj = {}
                for(let lang of i[prop]){
                    if(typeof lang === "string"){
                        obj["en"]=lang;
                    }else if(typeof lang._ == "string" && typeof lang.$.lang == "string"){
                        obj[lang.$.lang]=lang._;
                    } else {
                        console.warn(prop, i[prop])
                    }
                }
                d[prop] = obj;
            }else{
                console.warn(prop, i[prop])
            }
        }
        return d;
    })

    return data
}


const downloadAndSaveFile = async (uri, filename, useragent = null) => {
    let options = {};
    if(useragent !== null) {
        options = {headers: {'User-Agent': useragent}}
    }
    const xmldata = await fetch(uri, options).then(r => r.text());
    const data = convertData(await promisify(parseString)(xmldata));
    fs.writeFileSync(filename, JSON.stringify(data))
};

const createPathIfNotExist = (name, basepath) => {
    const dataPath = path.join(basepath, name);
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
        console.log(name + " dir created");
    }
    return dataPath;
};

const pathExist = path => new Promise((resolve, reject) => {
    fs.access(path, fs.F_OK, function(err) {
        if (!err) {
            resolve(true);
        } else {
            reject(path+" not found");
        }
    });
});


const readFileAsync = (fileName, encoding = "utf8") => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, encoding, (err, content) => {
            if (err) {
                reject(err);
            }
            resolve(content);
        })
    });
};


const getFilenamesInDir = (dirNmae) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dirNmae, (err, content) => {
            if (err) {
                reject(err);
            }
            resolve(content);
        })
    });
};

const readDirContent = async (dir) => {
    let fileNames = await getFilenamesInDir(dir);
    let filesPromises = [];
    for (let fileName of fileNames) {
        filesPromises.push(
            readFileAsync(dir + fileName)
                .then(r => JSON.parse(r))
                .then(r => Promise.resolve([fileName, r]))
                .catch(r => {
                    console.log("error", r, fileName);
                    return [fileName, {}]
                })
        )
    }
    let files = await Promise.all(filesPromises);
    let data = files.reduce((accumulator, currentValue) => {
        accumulator[currentValue[0]] = currentValue[1];
        return accumulator;
    }, {});

    return data;
}


module.exports = {
    downloadAndSaveFile,
    createPathIfNotExist,
    pathExist,
    readFileAsync,
    readDirContent
};