/**
 * Created by Benjamin on 10-05-2017.
 */
export default class ChannelList {

    constructor() {
        this.save = this.save.bind(this);

        if (localStorage.getItem("tvguide_channels") === null) {
            this.channels = [
                "dr1.dr.dk",
                "dr2.dr.dk",
                "dr3.dr.dk",
                "tv2.dk",
                "zulu.tv2.dk",
                "charlie.tv2.dk",
                "news.tv2.dk",
                "tv3.dk",
                "puls.tv3.dk",
                "tv3plus.dk",
                "dk4.dk",
                "kanal4.dk",
                "kanal5.dk",
                "6-eren.dk",
                "canal9.dk"
            ];
            this.defaultChannels = true;
        } else {
            this.channels = localStorage.getItem("tvguide_channels").split(",");
            this.defaultChannels = false;
        }
    }

    save() {
        localStorage.setItem("tvguide_channels", this.channels);
        this.defaultChannels = false;
    }
}