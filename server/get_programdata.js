const fs = require('fs'),
    path = require('path'),
    common = require("./helpers/date_and_path"),
    SavedVersion = require("./helpers/SavedVersion"),
    moment = require('moment'),
    request = require("request-promise-native"),
    parseString = require('xml2js').parseString,
    {promisify} = require('util');

const channel_names = JSON.parse(fs.readFileSync(path.join(__dirname, "channel_names.json"))),
    useragent = fs.readFileSync(path.join(__dirname, "useragent.txt"));

const readFileAsync = promisify(fs.readFile);

const cleanUp = (parentPath) => {
    let files = fs.readdirSync(parentPath);
    let yesterday = moment().startOf("day").subtract(1, 'days');

    for (let fileName of files) {
        let date = common.dateFromFilename(fileName);
        if (date === false) {
            console.log("invalid file name", fileName);
            continue;
        }
        if (date.isBefore(yesterday)) {
            fs.unlinkSync(path.join(parentPath, fileName));
        }
    }
};

const lastProgramUpdateFromProvider = async () => {
    const xmldata = await request("https://xmltv.xmltv.se/datalist.xml.gz", {headers: {'User-Agent': useragent}});
    const data = await promisify(parseString)(xmldata);
    const channels = data.tv.channel;

    let updateTimes = [];

    for (let channel of channels) {
        let channelUpdateTimes = {};
        if (typeof channel.datafor === "undefined") {
            continue
        }
        for (let day of channel.datafor) {
            channelUpdateTimes[day._] = parseInt(day.$.lastmodified.split(" ")[0]);
        }
        updateTimes[channel.$.id] = channelUpdateTimes
    }

    return updateTimes;
};

const getNextDays = (days) => {
    let day = moment().startOf('day');
    if ((new Date()).getHours() < 4) {
        day.subtract(1, "day");
        days++;
    }

    let dates = [];

    for (let i = 0; i < days; i++) {
        dates.push(day.format("YYYY-MM-DD"));
        day.add(1, "day")
    }
    return dates;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getNewData = async (lastProgramUpdateFromProviderData) => {
    const lastSavedVersion = new SavedVersion(),
        datesForTheNextWeek = getNextDays(10);


    for (let channelname of Object.keys(channel_names)) {
        for (let day of datesForTheNextWeek) {
            let url = "http://json.xmltv.se/" + channelname + "_" + day + ".js.gz";
            let save_path = path.join(__dirname, "data", "full_schedule", channelname + "_" + day + ".json");

            if (fs.existsSync(save_path)) {
                if (lastProgramUpdateFromProviderData[channelname] !== undefined && lastProgramUpdateFromProviderData[channelname][day] !== undefined) {
                    if (!lastSavedVersion.shouldBeDownloaded(channelname, day, lastProgramUpdateFromProviderData[channelname][day])) {
                        console.log("SKIP - " + url);
                        continue;
                    }
                }
            }

            try {
                await common.downloadAndSaveFile(url, save_path, useragent);
                lastSavedVersion.addItem(channelname, day);

                if (Math.random() > .8) { // just save the file once in a while
                    lastSavedVersion.save();
                }

                console.log("OK - " + url);
            } catch (e) {
                console.log("FAIL - " + url + " -- " + e)
            }
            await sleep(500);
        }
    }


    lastSavedVersion.cleanup();
    lastSavedVersion.save();
};

const createOverviewSchedule = async (fullScheduleRootPath, scheduleRootPath) => {
    let oldFiles = fs.readdirSync(scheduleRootPath);
    for (let oldFile of oldFiles) {
        fs.unlinkSync(path.join(scheduleRootPath, oldFile));
    }
    let fullSchedules = fs.readdirSync(fullScheduleRootPath);
    for (let fullSchedulePath of fullSchedules) {
        let fullSchedule = await readFileAsync(path.join(fullScheduleRootPath, fullSchedulePath), "utf8");
        try {
            fullSchedule = JSON.parse(fullSchedule);
        } catch (e) {
            console.log(fullSchedulePath + " could not be decoded");
            continue;
        }
        let compactSchedule = [];

        if (!Array.isArray(fullSchedule.jsontv.programme)) {
            console.log(fullSchedulePath + " could not be decoded");
            continue;
        }

        for (let program of fullSchedule.jsontv.programme) {
            let title = "Title ikke fundet";
            if (typeof program.title.da !== "undefined") {
                title = program.title.da;
            } else if (typeof program.title.en !== "undefined") {
                title = program.title.en;
            }
            compactSchedule.push([
                title,
                parseInt(program.start),
                parseInt(program.stop)
            ])
        }

        fs.writeFileSync(path.join(scheduleRootPath, fullSchedulePath), JSON.stringify(compactSchedule));
    }
};

(async function () {

    const dataPath = common.createPathIfNotExist("data", __dirname);

    const fullSchedulePath = common.createPathIfNotExist("full_schedule", dataPath);
    const schedulePath = common.createPathIfNotExist("schedule", dataPath);

    cleanUp(fullSchedulePath);

    const lastProgramUpdateFromProviderData = await lastProgramUpdateFromProvider();

    await getNewData(lastProgramUpdateFromProviderData);
    await createOverviewSchedule(fullSchedulePath, schedulePath);


})();
