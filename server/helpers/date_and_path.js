const fs = require('fs'),
    path = require('path'),
    request = require('request'),
    moment = require('moment');

const downloadAndSaveFile = (uri, filename, useragent = null) => new Promise((resolve, reject) => {
    let options = {};
    if(useragent !== null) {
        options = {headers: {'User-Agent': useragent}}
    }
    request(uri, options).pipe(fs.createWriteStream(filename))
        .on('error', reject)
        .on('close', resolve);
});

const createPathIfNotExist = (name, basepath) => {
    const dataPath = path.join(basepath, name);
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
        console.log(name + " dir created");
    }
    return dataPath;
};

const dateFromFilename = (filename) => {
    let match = filename.match(/_(\d{4})-(\d{2})-(\d{2})\.json/);
    if (match == null) {
        return false;
    }
    let date = moment(`${match[1]}-${match[2]}-${match[3]}`, "YYYY-MM-DD",true);
    if(!date.isValid()) {
        return false;
    }
    return date;
};

module.exports = {
    downloadAndSaveFile,
    createPathIfNotExist,
    dateFromFilename
};