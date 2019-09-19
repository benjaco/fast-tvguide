const fs = require('fs');
const path = require('path');
const express = require('express');
const {createPathIfNotExist} = require("./files");
const config = require("./../config");

const Greenlock = require('greenlock-express');
const redirectHttps = require('redirect-https');
const http = require('http');
const spdy = require('spdy');


async function push(res, base, fileName, contentType, content = null) {
    if (!config.secure) {
        return Promise.resolve();
    }
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
            fs.createReadStream(base + fileName, 'utf8')
                .pipe(stream);
        } else {
            stream.end(content);
            resolve(true);
        }
    })
}


function boostrap(routes) {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    app.use(routes);


    if (config.secure) {
        createPathIfNotExist("ssl_certs", path.join(__dirname, ".."));
        const greenlock = Greenlock.create({
            email: config.email,
            agreeTos: true,
            configDir: path.join(__dirname, "..", "ssl_certs")
        });


        const redirectHttpsMiddleware = redirectHttps();
        const acmeChallengeHandler = greenlock.middleware(redirectHttpsMiddleware);
        http.createServer(acmeChallengeHandler)
            .listen(8000, function () {
                console.log("Listening for ACME http-01 challenges on", this.address());
            });


        const spdyOptions = Object.assign({}, greenlock.tlsOptions);
        spdyOptions.spdy = {protocols: ['h2', 'http/1.1'], plain: false};

        spdy.createServer(spdyOptions, app)
            .on('error', function (err) {
                console.error(err);
            })
            .on('listening', function () {
                console.log("Listening for SPDY/http2/https requests on", this.address());
            })
            .listen(8001);
    } else {
        console.log("use http");
        app.listen(8000)

    }
}

module.exports = {push, boostrap};
