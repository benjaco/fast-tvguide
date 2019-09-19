const fs = require('fs'),
    path = require('path'),
    {downloadAndSaveFile, readFileAsync, createPathIfNotExist} = require("./helpers/files"),
    config = require("./config"),
    SavedVersion = require("./helpers/SavedVersion"),
    moment = require('moment'),
    request = require("request-promise-native"),
    parseString = require('xml2js').parseString,
    {promisify} = require('util');

const channel_names = JSON.parse(fs.readFileSync(path.join(__dirname, "channel_names.json")));

const dateFromFilename = (filename) => {
    let match = filename.match(/_(\d{4})-(\d{2})-(\d{2})\.json/);
    if (match == null) {
        return false;
    }
    let date = moment(`${match[1]}-${match[2]}-${match[3]}`, "YYYY-MM-DD", true);
    if (!date.isValid()) {
        return false;
    }
    return date;
};


const cleanUp = (parentPath) => {
    let files = fs.readdirSync(parentPath);
    let yesterday = moment().startOf("day").subtract(1, 'days');

    for (let fileName of files) {
        let date = dateFromFilename(fileName);
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
    const xmldata = await request("https://xmltv.xmltv.se/datalist.xml.gz", {headers: {'User-Agent': config.userAgent}});
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
    let updated = false;


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
                await downloadAndSaveFile(url, save_path, config.userAgent);
                lastSavedVersion.addItem(channelname, day);

                if (Math.random() > .8) { // just save the file once in a while
                    lastSavedVersion.save();
                }

                console.log("OK - " + url);
                updated = true;
            } catch (e) {
                console.log("FAIL - " + url + " -- " + e)
            }
            await sleep(500);
        }
    }


    lastSavedVersion.cleanup();
    lastSavedVersion.save();

    return updated;
};

const createOverviewSchedule = async (fullScheduleRootPath, scheduleRootPath) => {
    let oldFiles = fs.readdirSync(scheduleRootPath);
    for (let oldFile of oldFiles) {
        fs.unlinkSync(path.join(scheduleRootPath, oldFile));
    }
    let fullSchedules = fs.readdirSync(fullScheduleRootPath);
    for (let fullSchedulePath of fullSchedules) {
        let fullSchedule = await readFileAsync(path.join(fullScheduleRootPath, fullSchedulePath));
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

async function task() {

    const dataPath = createPathIfNotExist("data", __dirname);

    const fullSchedulePath = createPathIfNotExist("full_schedule", dataPath);
    const schedulePath = createPathIfNotExist("schedule", dataPath);

    cleanUp(fullSchedulePath);

    const lastProgramUpdateFromProviderData = await lastProgramUpdateFromProvider();

    let updated = await getNewData(lastProgramUpdateFromProviderData);
    if (updated) {
        await createOverviewSchedule(fullSchedulePath, schedulePath);
    }
    return updated;
}


if (require.main === module) {
    task();
} else {
    module.exports = task;
}
