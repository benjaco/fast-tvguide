const fs = require('fs'),
    path = require('path'),
    Jimp = require("jimp"),
    common = require("./helpers/files");


const channel_names = JSON.parse(fs.readFileSync(path.join(__dirname, "channel_names.json")));



const downloadMissingImages = async (imagePath) => {
    for (let channelname of Object.keys(channel_names)) {
        try {
            let channelimagePath = path.join(imagePath, channelname + ".png");
            if (!fs.existsSync(channelimagePath)) {
                await common.downloadAndSaveFile("http://logos.xmltv.se/" + channelname + ".png", channelimagePath);
                console.log(channelimagePath + " has been downloaded")
            } else {
                console.log(channelname + " image already exists");
            }
        } catch (e) {
            console.log(channelname + " failed to be downloaded ");
            console.log(e);
        }
    }
};

const resizeAllImages = async (from, to, size) => {
    let files = fs.readdirSync(from);
    let promises = [];
    for (let fileName of files) {
        let fullFilename = path.join(from, fileName);
        let distFilename = path.join(to, fileName);

        promises.push(
            Jimp.read(fullFilename).then(image =>
                image.resize(size, size)
                    .write(distFilename)
            )
        )
    }
    await Promise.all(promises);
    console.log("Image resized")
};


const task = async () => {
    const dataPath = common.createPathIfNotExist("data", __dirname);

    const largeImagePath = common.createPathIfNotExist("large_images", dataPath);
    const imagePath = common.createPathIfNotExist("images", dataPath);

    await downloadMissingImages(largeImagePath);

    await resizeAllImages(largeImagePath, imagePath, 40);
}

if(require.main === module) {
    task();
}else{
    module.exports = task;
}
