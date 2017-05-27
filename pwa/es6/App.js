/**
 * Created by Benjamin on 10-05-2017.
 */
import ChannelList from "./ChannelList"
import ChannelsRender from "./ChannelsRender"
import Responsive from "./Responsive"
import TimeRender from "./TimeRender"
import TimelineRender from "./TimelineRender";
import OngoingTime from "./OngoingTime";
import Program from "./Program";
import Dates from "./Dates"
import ChannelEdit from "./ChannelEdit"
/**
 * @preserve jquery-param (c) 2015 KNOWLEDGECODE | MIT
 */
function param(a) {
    var s = [], rbracket = /\[\]$/,
        isArray = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }, add = function (k, v) {
            v = typeof v === 'function' ? v() : v === null ? '' : v === undefined ? '' : v;
            s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
        }, buildParams = function (prefix, obj) {
            var i, len, key;

            if (prefix) {
                if (isArray(obj)) {
                    for (i = 0, len = obj.length; i < len; i++) {
                        if (rbracket.test(prefix)) {
                            add(prefix, obj[i]);
                        } else {
                            buildParams(prefix + '[' + (typeof obj[i] === 'object' ? i : '') + ']', obj[i]);
                        }
                    }
                } else if (obj && String(obj) === '[object Object]') {
                    for (key in obj) {
                        buildParams(prefix + '[' + key + ']', obj[key]);
                    }
                } else {
                    add(prefix, obj);
                }
            } else if (isArray(obj)) {
                for (i = 0, len = obj.length; i < len; i++) {
                    add(obj[i].name, obj[i].value);
                }
            } else {
                for (key in obj) {
                    buildParams(key, obj[key]);
                }
            }
            return s;
        };

    return buildParams('', a).join('&').replace(/%20/g, '+');
}

function requestAnimationFramePromise() {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(resolve);
    })
}

class App {
    constructor() {
        this.renderDayIfNeeded = this.renderDayIfNeeded.bind(this);
        this.addScrollListener = this.addScrollListener.bind(this);

        this.week = App.getWeek();
        this.renderedDays = [];
        this.renderYesterday = (() => {
            const date = new Date();
            if (date.getHours() < 5) {
                date.setDate(date.getDate() - 1);
                return date.getFullYear() + "-" + App.addZero(date.getMonth() + 1) + "-" + App.addZero(date.getDate())
            } else {
                return false;
            }
        })();

        this.channelList = new ChannelList();
        this.render = new ChannelsRender(this);
        this.responsive = new Responsive(this);
        this.timeRender = new TimeRender(this, this.week.length);
        this.timelineRender = new TimelineRender(this);
        this.program = new Program();
        this.ongoingTime = new OngoingTime(this);
        this.daysRender = new Dates(this.week);
        this.channelEdit = new ChannelEdit(this);

        this.daysRender.onDayClick = index => {
            this.renderDayIfNeeded(index);


            if (index === 0) {
                document.getElementsByClassName("channel-programs")[0].scrollLeft = (new Date()).getHours() * this.responsive.timeLength - 50;
            } else {
                document.getElementsByClassName("channel-programs")[0].scrollLeft = index * 24 * this.responsive.timeLength + this.responsive.timeLength * 9;
            }

        };

        this.render.onProgramClick = data => this.program.show(data);

        this.channelEdit.onUpdate = newList => {
            this.channelList.channels = newList;
            this.channelList.save();

            this.render.renderList(this.channelList.channels, this.channelNames);

            let renderDays = this.renderedDays;
            this.renderedDays = [];
            for (let i of renderDays) {
                this.renderDayIfNeeded(i)
            }
            if (this.renderYesterday !== false) {
                this.renderDayFromDate(this.renderYesterday);
            }
        };

        this.anchor = (function () {
            let d = new Date();
            d.setHours(0, 0, 0, 0);
            return d.getTime() / 1000;
        })();


        this.responsive.onUpdate = (desktop) => {
            this.ongoingTime.update(); // update now bar to be calculated from the new hour with
            if (desktop) {
                this.timeRender.showDesktopTimeline();
            } else {
                this.timeRender.showMobileTimeline();
            }
        };
        this.responsive.triggerUpdate();
        this.addScrollListener();

        document.getElementsByClassName("channel-programs")[0].scrollLeft = (new Date()).getHours() * this.responsive.timeLength - 50;

        fetch("../server/data/channels/dk_channel_names_manuel.json")
            .then(result => result.json())
            .then(data => {
                this.channelNames = data;

                this.render.renderList(this.channelList.channels, this.channelNames);

                if (this.renderYesterday !== false) {
                    this.renderDayFromDate(this.renderYesterday);
                }
                return this.renderDayIfNeeded(0)
            });


        // Add a service worker to the page
        navigator.serviceWorker.register('sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }
    addScrollListener() {
        let element = document.querySelector(".channel-programs");
        element.addEventListener("scroll", () => {
            let focusDayIndexLeftSide = Math.floor(element.scrollLeft / (24 * this.responsive.timeLength));
            let focusDayIndexRightSude = Math.floor((element.scrollLeft + window.innerWidth) / (24 * this.responsive.timeLength));
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
    renderDayFromDate(date){
        return new Promise((resolve, reject) => {
            let url = "../server/get_overview.php?" + param({
                    channels: this.channelList.channels,
                    dates: [date]
                });

            fetch(url).then(r => r.json()).then(r => {
                this.timelineRender.render(r.channels, this.anchor);
                resolve();
            }).catch(() => reject());
        })
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

window.onload = () => {
    window.app = new App();
};