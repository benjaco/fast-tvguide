const express = require("express"),
    path = require("path"),
    {boostrap, push, readFileAsync, readDirAsync} = require('./helpers/bootstrapServer'),
    Joi = require('joi');


const app = express();

let staticContent = {};
let tvData = {
    "full_schedule": {},
    "schedule": {},
};

async function updateStaticContent() {
    staticContent = {
        "index.html": await readFileAsync("../pwa/index.html"),
        "app.js": await readFileAsync("../pwa/app.js"),
        "icons/close.png": await readFileAsync("../pwa/icons/close.png", null),
    };
}

async function readDir(dir) {
    let fileNames = await readDirAsync(dir);
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

async function readTvData() {
    tvData.full_schedule = await readDir("./data/full_schedule/");
    tvData.schedule = await readDir("./data/schedule/");
}

app.get("/", async (req, res) => {
    res.locals.todos = [
        push(res, "./../pwa", "/app.js", 'application/javascript', staticContent["app.js"]),
        push(res, "./../pwa", "/icons/close.png", 'image/png', staticContent["icons/close.png"]),
    ];
    res.write(staticContent["index.html"]);

    await Promise.all(res.locals.todos);
    res.end();
});

const overviewSchema = Joi.object().keys({
    channels: Joi.array().items(Joi.string().required()).min(1).required(),
    dates: Joi.array().items(Joi.string().required()).min(1).required()
});
app.get("/overview", async (req, res) => {
    const validated = Joi.validate(req.query, overviewSchema);
    if (validated.error) {
        res.status(400).end();
        return;
    }

    let data = {};
    for (let channel of validated.value.channels) {
        for (let date of validated.value.dates) {
            let key = channel + "_" + date + ".json";
            if (tvData.schedule[key] !== undefined) {
                if (data[channel] === undefined) {
                    data[channel] = {};
                }
                data[channel][date] = tvData.schedule[key];
            }
        }
    }

    res.json({
        channels: data,
        status: "Success",
        status_code:  1
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
        let program = tvData.full_schedule[key].jsontv.programme[validated.value.no];
        if (program) {
            res.json({
                status: "Success",
                status_code: 1,
                program
            })
        }else {
            res.status(400).end();
            return;
        }
    }else{
        res.status(400).end();
        return;
    }

});

app.get("/last_update", async (req, res) => {
    res.send(await readFileAsync("./data/last_update.json"))
});

app.get("/channel_names", async (req, res) => {
    res.send(await readFileAsync("./channel_names.json"))
});

app.use("/images", express.static(path.join(__dirname, 'data', "images")));

app.use(express.static(path.join(__dirname, '..', "pwa")));


(async _ => {
    await updateStaticContent();
    await readTvData();
    boostrap(app);
})();
