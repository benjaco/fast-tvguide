const fs = require('fs'),
    path = require('path'),
    request = require('request');

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