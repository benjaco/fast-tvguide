const express = require("express"),
    path = require("path"),
    server = require('./helpers/bootstrapServer'),
    Joi = require('joi'),
    ServerRender = require("./helpers/serverRender"),
    DataUpdater = require("./helpers/dataUpdater"),
    {pathExist, readFileAsync, readDirContent} = require('./helpers/files'),
    device = require('express-device');


const app = express();

let staticContent = {};
let tvData = {
    "full_schedule": {},
    "schedule": {},
};

async function updateStaticContent() {
    staticContent = {
        "index.html": await readFileAsync(__dirname + "/../pwa/index.html"),
        "app.js": await readFileAsync(__dirname + "/../pwa/app.js"),
        "icons/close.png": await readFileAsync(__dirname + "/../pwa/icons/close.png", null),
    };
}


async function readTvData() {
    try {
        if (await pathExist(__dirname + "/data/full_schedule/")) {
            tvData.full_schedule = await readDirContent(__dirname + "/data/full_schedule/");
            console.log("full_schedule has been reloaded")
        }
    } catch (e) {
        console.log(e);
    }

    try {
        if (await pathExist(__dirname + "/data/schedule/")) {
            tvData.schedule = await readDirContent(__dirname + "/data/schedule/");
            console.log("schedule has been reloaded")
        }
    } catch (e) {
        console.log(e);
    }
}

app.get("/", device.capture(), async (req, res) => {
    res.locals.todos = [
        server.push(res, __dirname + "/../pwa", "/app.js", 'application/javascript', staticContent["app.js"])
    ];
    if (req.device.type === "phone") {
        res.write(ServerRender.renderedPhonePage);
    } else {
        res.write(ServerRender.renderedDesktopPage);
    }
    await Promise.all(res.locals.todos);
    res.end();
});
app.get("/static_render_offscreen_elements/:id", async (req, res) => {
    if (parseInt(req.params.id).toString() === req.params.id.toString()) {
        let id = parseInt(req.params.id);
        if (typeof ServerRender.phonePageMissingDiagrams[id] !== "undefined") {
            res.send(ServerRender.phonePageMissingDiagrams[id]);
        } else {
            res.send("{}")
        }
    } else {
        res.send("{}")
    }
});

const overviewSchema = Joi.object().keys({
    channels: Joi.array().items(Joi.string().required()).min(1).required(),
    dates: Joi.array().items(Joi.string().required()).min(1).required()
});

function buildOverview(channels, dates) {
    let data = {};
    for (let channel of channels) {
        for (let date of dates) {
            let key = channel + "_" + date + ".json";
            if (tvData.schedule[key] !== undefined) {
                if (data[channel] === undefined) {
                    data[channel] = {};
                }
                data[channel][date] = tvData.schedule[key];
            }
        }
    }
    return data;
}

app.get("/overview", async (req, res) => {
    const validated = Joi.validate(req.query, overviewSchema);
    if (validated.error) {
        res.status(400).end();
        return;
    }

    let data = buildOverview(validated.value.channels, validated.value.dates);

    res.json({
        channels: data,
        status: "Success",
        status_code: 1
    })
});

const allInfoSchema = Joi.object().keys({
    channel: Joi.string().required(),
    date: Joi.string().required(),
    no: Joi.number().min(0).required()
});
app.get("/all_info", async (req, res) => {
    const validated = Joi.validate(req.query, allInfoSchema);
    if (validated.error) {
        res.status(400).end();
        return;
    }

    let key = validated.value.channel + "_" + validated.value.date + ".json";
    if (tvData.full_schedule[key] !== undefined) {
        let program = tvData.full_schedule[key][validated.value.no];
        if (program) {
            res.json({
                status: "Success",
                status_code: 1,
                program
            });
            return;
        } else {
            res.status(400).end();
            return;
        }
    } else {
        res.status(400).end();
        return;
    }

});

app.get("/last_update", async (req, res) => {
    res.send(await readFileAsync(__dirname + "/data/last_update.json"))
});

app.get("/channel_names", async (req, res) => {
    res.send(await readFileAsync(__dirname + "/channel_names.json"))
});

app.use("/images", express.static(path.join(__dirname, 'data', "images")));


app.get("/reload_data/yIZeORFAypJnQy0OdqhuGR9KLTZGsCjf7W9U8ka9", async (req, res) => {
    res.end();
    await updateStaticContent();
    await readTvData();
    ServerRender.setTemplate(staticContent["index.html"]);
});

app.use(express.static(path.join(__dirname, '..', "pwa")));


(async _ => {
    await updateStaticContent();
    await readTvData();
    ServerRender.dataRetriever = buildOverview;
    ServerRender.setTemplate(staticContent["index.html"]);

    DataUpdater.dataChange = async function () {
        console.log("new data available");
        await readTvData();
        ServerRender.setData({});
        ServerRender.triggerRender();
    };

    DataUpdater.init();

    server.boostrap(app);
})();
