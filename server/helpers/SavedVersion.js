const fs = require('fs'),
    path = require('path'),
    moment = require('moment');

class SavedVersion {
    constructor(filename = "last_update.json") {
        this.lastSavedPath = path.join(__dirname, "../", "data", filename);
        this.data = {};
        if (fs.existsSync(this.lastSavedPath)) {
            this.data = JSON.parse(fs.readFileSync(this.lastSavedPath));
        }
    }

    save(){
        fs.writeFileSync(this.lastSavedPath, JSON.stringify(this.data))
    }

    shouldBeDownloaded(channel, date, lastUpdated){
        if(!(channel in this.data)) {
            return true;
        }
        if(!(date in this.data[channel])){
            return true;
        }
        let lastSaved = this.data[channel][date];
        let lastSavedDate = moment(lastSaved, "X", true),
            lastUpdatedDate = moment(lastUpdated, "YYYYMMDDHHmmss", true);

        if(!lastSavedDate.isValid()||!lastUpdatedDate.isValid()) {
            console.log(`last updated data (${lastUpdated}) or saved data (${lastSaved}) was invalid dates`);
            return true;
        }

        return lastUpdatedDate > lastSavedDate;
    }

    addItem(channel, date, updated) {
        if(!(channel in this.data)) {
            this.data[channel] = {};
        }
        if(typeof updated === "undefined") {
            updated = moment().format("X");
        }else{
            if(moment(updated, "YYYYMMDDHHmmss", true).isValid()) {
                updated = moment(updated, "YYYYMMDDHHmmss", true).format("X")
            }else if(moment(updated, "X", true).isValid() === false) {
                console.log(`${updated} has to be a unix time stamp without ms or formatted YYYYMMDDHHmmss`);
                return;
            }
        }
        this.data[channel][date] = updated;
    }

    cleanup(removeIfBefore){
        if (typeof removeIfBefore === "undefined") {
            removeIfBefore = moment().startOf("day").subtract(1, 'days');
        }
        for (let channel of Object.keys(this.data)) {
            for(let date of Object.keys(this.data[channel])) {
                let momentDate = moment(date, "YYYY-MM-DD", true);
                if(!momentDate.isValid() ) {
                    console.log(`${date} in ${channel} is a invalid date`);
                    continue;
                }
                if(momentDate.isBefore(removeIfBefore)) {
                    delete this.data[channel][date];
                }
            }
        }
    }
}

module.exports = SavedVersion;