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

function requestAnimationFramePromise() {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(resolve);
    })
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

        const guiReady = domReady().then(_ => {
            this.setUpGui();
            return Promise.resolve();
        });

        let tvguideDataPromise = this.getTvguideData(this.week[0].url);

        guiReady
            .then(_ => tvguideDataPromise)
            .then(r => {
                this.renderedDays.push(0);
                let [unrenderedPrograms, unrenderedChannels] = this.timelineRender.firstRender(r.channels, this.channelList.channels);
                document.getElementsByClassName("channel-programs")[0].scrollLeft = (new Date()).getHours() * this.responsive.timeLength - 50;


                return requestAnimationFramePromise()
                    .then(_ => requestAnimationFramePromise())
                    .then(_ => {
                        this.channelsIconRender.render(this.channelList.channels);
                        return requestAnimationFramePromise();
                    })
                    .then(_ => requestAnimationFramePromise())
                    .then(_ => {
                        this.timelineRender.addMissingSetup();
                        this.timelineRender.addEventListener();
                        this.addScrollListener();
                        this.timelineRender.addElementsRender(unrenderedChannels, false);
                        this.timelineRender.addMissingProgramsRender(unrenderedPrograms);

                        if (this.renderYesterday !== false) {
                            this.renderDayFromDate(this.renderYesterday)
                        }
                        if((new Date()).getHours() + (this.responsive.width / this.responsive.timeLength) > 24) {
                            this.renderDayIfNeeded(1)
                        }
                        return fetch("../server/data/channels/dk_channel_names_manuel.json")
                    })
                    .then(r => r.json())
                    .catch(_ => {
                        return Promise.resolve([])
                    });
            })
            .then(r => {
                this.channelNames = r;
                this.channelsIconRender.addLabels(r);

                this.timeRender.renderDays(this.week.length);
            })
            .then(_ => LoadScript("show_program.js"))
            .then(_ => {
                this.program = new window.Program();
                this.timelineRender.onProgramClick = data => this.program.show(data);
            })
            .then(_ => LoadScript("channel_editor.js"))
            .then(_ => {
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
            })
            .then(_ => {
                navigator.serviceWorker.register('sw.js');

                console.log('[AIV]{version}[/AIV]');

                window.requestIdleCallback(_ => {
                    this.dataRetriever.updateCache()
                })
            });
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
