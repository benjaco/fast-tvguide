/**
 * Created by Benjamin on 10-05-2017.
 */
import ChannelList from "./ChannelList"
import ChannelsIconRender from "./ChannelsIconRender"
import Responsive from "./Responsive"
import TimeRender from "./TimeRender"
import TimelineRender from "./TimelineRender";
import OngoingTime from "./OngoingTime";
import Dates from "./Dates"
import LoadScript from "./LoadScript"
import DataRetriever from "./DataRetriever";
import LoadCSS from "./LoadCSS"

function requestAnimationFramePromise() {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(resolve);
    })
}

function dobbleRAF() {
    return requestAnimationFramePromise().then(requestAnimationFramePromise);
}

class App {
    constructor() {
        this.renderDayIfNeeded = this.renderDayIfNeeded.bind(this);
        this.renderDayFromDate = this.renderDayFromDate.bind(this);
        this.addScrollListener = this.addScrollListener.bind(this);
        this.getTvguideData = this.getTvguideData.bind(this);
        this.setUpGui = this.setUpGui.bind(this);

        this.week = App.getWeek();
        this.channelList = new ChannelList();
        this.dataRetriever = new DataRetriever(this);


        this.renderedDays = [];
        this.renderYesterday = (() => {
            const date = new Date();
            if (date.getHours() < 15) {
                date.setDate(date.getDate() - 1);
                return date.getFullYear() + "-" + App.addZero(date.getMonth() + 1) + "-" + App.addZero(date.getDate())
            } else {
                return false;
            }
        })();

        this.dataRetriever.onCacheUpdate = (data) => {
            this.timelineRender.addElementsRender(data.channels, true);
        };

        const domReady = () => {
            return new Promise((resolve, reject) => {
                if (document.readyState !== "loading") {
                    resolve();
                } else {
                    document.addEventListener("DOMContentLoaded", () => {
                        resolve();
                    });
                }
            })
        };

        (async () => {
            let [tvGuideData, _] = await Promise.all([
                this.getTvguideData(this.week[0].url),
                domReady().then(this.setUpGui)
            ]);

            this.renderedDays.push(0);
            let [unrenderedPrograms, unrenderedChannels] = this.timelineRender.firstRender(tvGuideData.channels, this.channelList.channels);

            await dobbleRAF();
            this.channelsIconRender.render(this.channelList.channels);
            await dobbleRAF();

            this.timelineRender.addMissingSetup();
            this.timelineRender.addEventListener();
            this.addScrollListener();
            if (Object.keys(unrenderedChannels).length > 0) {
                this.timelineRender.addElementsRender(unrenderedChannels, false);
            }
            this.timelineRender.addMissingProgramsRender(unrenderedPrograms);

            if (this.renderYesterday !== false) {
                this.renderDayFromDate(this.renderYesterday)
            }
            if ((new Date()).getHours() + (this.responsive.width / this.responsive.timeLength) > 24) {
                this.renderDayIfNeeded(1)
            }
            let channelNames = fetch("../channel_names").then(r => r.json()).catch(_ => Promise.resolve([]));

            this.channelNames = channelNames;
            this.channelsIconRender.addLabels(channelNames);

            this.timeRender.renderDays(this.week.length);

            dobbleRAF().then(LoadCSS("style.min.css"));

            await LoadScript("show_program.js");
            this.program = new window.Program();
            this.timelineRender.onProgramClick = data => this.program.show(data);

            await LoadScript("channel_editor.js");
            this.channelEdit = new window.ChannelEdit(this);
            this.channelEdit.onUpdate = newList => {
                this.channelList.channels = newList;
                this.channelList.save();

                this.timelineRender.updateChannelList(this.channelList.channels);
                this.channelsIconRender.render(this.channelList.channels);
                this.channelsIconRender.addLabels(this.channelNames);

                let renderDays = this.renderedDays;
                this.renderedDays = [];
                for (let i of renderDays) {
                    this.renderDayIfNeeded(i)
                }
                if (this.renderYesterday !== false) {
                    this.renderDayFromDate(this.renderYesterday);
                }
            };

            navigator.serviceWorker.register('sw.js');

            console.log('[AIV]{version}[/AIV]');

            window.requestIdleCallback(_ => {
                this.dataRetriever.updateCache()
            })
        })();


    }

    setUpGui() {
        this.responsive = new Responsive(this);
        this.channelsIconRender = new ChannelsIconRender(this);
        this.timeRender = new TimeRender(this, this.responsive.mode);
        this.timelineRender = new TimelineRender(this);
        this.ongoingTime = new OngoingTime(this);
        this.daysRender = new Dates(this.week);

        this.timeRender.renderDays(1);

        this.daysRender.onDayClick = index => {
            this.renderDayIfNeeded(index);

            if (index === 0) {
                document.getElementsByClassName("channel-programs")[0].scrollLeft = (new Date()).getHours() * this.responsive.timeLength - 50;
            } else {
                document.getElementsByClassName("channel-programs")[0].scrollLeft = index * 24 * this.responsive.timeLength + this.responsive.timeLength * 9;
            }
        };

        this.anchor = (function () {
            let d = new Date();
            d.setHours(0, 0, 0, 0);
            return d.getTime() / 1000;
        })();

        this.ongoingTime.updateTime();

        this.responsive.onUpdate((desktop) => {
            this.ongoingTime.updateTime(); // update now bar to be calculated from the new hour with
            if (desktop) {
                this.timeRender.showDesktopTimeline();
            } else {
                this.timeRender.showMobileTimeline();
            }
        });

        document.getElementsByClassName("channel-programs")[0].scrollLeft = (new Date()).getHours() * this.responsive.timeLength - 50;

    }

    addScrollListener() {
        let element = document.querySelector(".channel-programs");
        element.addEventListener("scroll", () => {
            let focusDayIndexLeftSide = Math.floor(element.scrollLeft / (24 * this.responsive.timeLength));
            let focusDayIndexRightSude = Math.floor((element.scrollLeft + this.responsive.width) / (24 * this.responsive.timeLength));
            this.daysRender.focus(focusDayIndexLeftSide);

            this.renderDayIfNeeded(focusDayIndexLeftSide);
            this.renderDayIfNeeded(focusDayIndexRightSude);
        }, {passive: true});
    }

    renderDayIfNeeded(dayIndex) {

        if (this.renderedDays.includes(dayIndex)) {
            return;
        }
        if (dayIndex >= this.week.length) {
            return;
        }
        this.renderedDays.push(dayIndex);

        return this.renderDayFromDate(this.week[dayIndex].url)


    }

    getTvguideData(date) {
        return this.dataRetriever.get(date)
            .then(([data, indicator]) => {
                // console.log("Data ", indicator);

                return Promise.resolve(data);
            });
    }

    renderDayFromDate(date) {
        return this.getTvguideData(date).then(r => {
            this.timelineRender.addElementsRender(r.channels, true);
            return Promise.resolve()
        });
    }

    static getWeek() {
        const weekDayName = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
        let list = [];
        let date = new Date();

        for (let i = 0; i < 7; i++) {
            list.push({
                url: date.getFullYear() + "-" + App.addZero(date.getMonth() + 1) + "-" + App.addZero(date.getDate()),
                readable: weekDayName[date.getDay()] + " " + date.getDate() + "."
            });
            date.setDate(date.getDate() + 1);
        }
        return list;
    }

    static addZero(nr) {
        if (nr < 10) {
            return "0" + nr;
        }
        return nr;
    };


}

window._app = new App();
