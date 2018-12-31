const fs = require('fs');
const http2 = require('spdy');
var express = require('express');


function readFileAsync(fileName, encoding = "utf8") {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, encoding, (err, content) => {
            if (err) {
                reject(err);
            }
            resolve(content);
        })
    });
}



function readDirAsync(dirNmae) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirNmae, (err, content) => {
            if (err) {
                reject(err);
            }
            resolve(content);
        })
    });
}




async function push(res, base, fileName, contentType, content = null) {
    return new Promise((resolve, reject) => {
        const stream = res.push(fileName, {
            status: 200, // optional
            method: 'GET', // optional
            request: {
                accept: '*/*'
            },
            response: {
                'content-type': contentType
            }
        });

        stream.on('error', function (e) {
            resolve(false);
        });

        if (content === null) {
            fs.readFile(base + fileName, 'utf8', (err, content) => {
                if (err) {
                    reject();
                }
                stream.end(content);
                resolve(true);
            });
        }else {
            stream.end(content);
            resolve(true);
        }
    })
}



function boostrap(routes) {
    var app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    app.use(routes);


    var options = {
        key: fs.readFileSync(__dirname+'./../localhost-ssl-keys/server.key'),
        cert: fs.readFileSync(__dirname+'./../localhost-ssl-keys/server.crt')
    };

    http2
        .createServer(options, app)
        .listen(8080, () => {
            console.log(`Server is listening on https://localhost:8080.
You can open the URL in the browser.`)
        })

}

module.exports = {push, boostrap, readFileAsync, readDirAsync}