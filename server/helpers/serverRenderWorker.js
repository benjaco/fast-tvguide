const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const {parentPort} = require('worker_threads');
const minify = require('html-minifier').minify;
const EventEmitter = require('events');
process.env.TZ = 'Europe/Copenhagen';


class DataChangeEmitter extends EventEmitter {
}


class ServerRenderWorker {
    constructor() {
        this.template = "";
        this.renderedPhonePage = "";
        this.renderedDesktopPage = "";
        this.phonePageMissingPrograms = "";
        this.phoneRenderingKey = 0;

        this.data = false;
        this.dataKey = false;


        this.render = this.render.bind(this);
        this.renderPage = this.renderPage.bind(this);
        this.addZero = this.addZero.bind(this);
        this.render_week = this.render_week.bind(this);
        this.firstRender = this.firstRender.bind(this);
        this.renderProgram = this.renderProgram.bind(this);
        this.timeOnDay = this.timeOnDay.bind(this);
        this.setData = this.setData.bind(this);

        this.dataChange = new DataChangeEmitter();
    }

    setData(data, key) {
        this.data = data;
        this.key = key;
        this.dataChange.emit("change");
    }

    async render() {
        console.log("Render");
        let anchor = (function () {
            let d = new Date();
            d.setHours(0, 0, 0, 0);
            return d.getTime() / 1000;
        })();

        let renderedPhonePage = await this.renderPage({
            anchor,
            mobile: true,
            timeLength: 160,
            programHeight: 48,
            padding: 5,
            weeklength: 7,
            partial: [-1, 5.5]
        });
        this.renderedPhonePage = renderedPhonePage.page;
        this.phonePageMissingPrograms = renderedPhonePage.missingPrograms;
        this.phoneRenderingKey = renderedPhonePage.renderingKey;

        this.renderedDesktopPage = (await this.renderPage({
            anchor,
            mobile: false,
            timeLength: 220,
            programHeight: 62,
            padding: 9,
            weeklength: 7,
            partial: false
        })).page;
    }

    async renderPage(param) {
        let defaultChannels = [
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


        const dom = new JSDOM(this.template);
        const renderingKey = Date.now();

        // for (let script of dom.window.document.scripts) {
        //     script.remove();
        // }

        let newScriptTag = dom.window.document.createElement("script");
        newScriptTag.innerHTML = `let serverRendered = true, renderingKey = ${renderingKey}; console.log("server rendered");`;
        dom.window.document.head.appendChild(newScriptTag);

        if (param.mobile) {
            dom.window.document.querySelector(".timeDesktop").style.display = "none";
            dom.window.document.querySelector(".timeMobile").innerHTML = `<div class="timeonday" style="left: 0px;">0:00</div><div class="timeonday" style="left: 80px;">0:30</div><div class="timeonday" style="left: 160px;">1:00</div><div class="timeonday" style="left: 240px;">1:30</div><div class="timeonday" style="left: 320px;">2:00</div><div class="timeonday" style="left: 400px;">2:30</div><div class="timeonday" style="left: 480px;">3:00</div><div class="timeonday" style="left: 560px;">3:30</div><div class="timeonday" style="left: 640px;">4:00</div><div class="timeonday" style="left: 720px;">4:30</div><div class="timeonday" style="left: 800px;">5:00</div><div class="timeonday" style="left: 880px;">5:30</div><div class="timeonday" style="left: 960px;">6:00</div><div class="timeonday" style="left: 1040px;">6:30</div><div class="timeonday" style="left: 1120px;">7:00</div><div class="timeonday" style="left: 1200px;">7:30</div><div class="timeonday" style="left: 1280px;">8:00</div><div class="timeonday" style="left: 1360px;">8:30</div><div class="timeonday" style="left: 1440px;">9:00</div><div class="timeonday" style="left: 1520px;">9:30</div><div class="timeonday" style="left: 1600px;">10:00</div><div class="timeonday" style="left: 1680px;">10:30</div><div class="timeonday" style="left: 1760px;">11:00</div><div class="timeonday" style="left: 1840px;">11:30</div><div class="timeonday" style="left: 1920px;">12:00</div><div class="timeonday" style="left: 2000px;">12:30</div><div class="timeonday" style="left: 2080px;">13:00</div><div class="timeonday" style="left: 2160px;">13:30</div><div class="timeonday" style="left: 2240px;">14:00</div><div class="timeonday" style="left: 2320px;">14:30</div><div class="timeonday" style="left: 2400px;">15:00</div><div class="timeonday" style="left: 2480px;">15:30</div><div class="timeonday" style="left: 2560px;">16:00</div><div class="timeonday" style="left: 2640px;">16:30</div><div class="timeonday" style="left: 2720px;">17:00</div><div class="timeonday" style="left: 2800px;">17:30</div><div class="timeonday" style="left: 2880px;">18:00</div><div class="timeonday" style="left: 2960px;">18:30</div><div class="timeonday" style="left: 3040px;">19:00</div><div class="timeonday" style="left: 3120px;">19:30</div><div class="timeonday" style="left: 3200px;">20:00</div><div class="timeonday" style="left: 3280px;">20:30</div><div class="timeonday" style="left: 3360px;">21:00</div><div class="timeonday" style="left: 3440px;">21:30</div><div class="timeonday" style="left: 3520px;">22:00</div><div class="timeonday" style="left: 3600px;">22:30</div><div class="timeonday" style="left: 3680px;">23:00</div><div class="timeonday" style="left: 3760px;">23:30</div><div class="timeonday" style="left: 3840px;">0:00</div><div class="timeonday" style="left: 3920px;">0:30</div><div class="timeonday" style="left: 4000px;">1:00</div><div class="timeonday" style="left: 4080px;">1:30</div><div class="timeonday" style="left: 4160px;">2:00</div><div class="timeonday" style="left: 4240px;">2:30</div><div class="timeonday" style="left: 4320px;">3:00</div>`;
            dom.window.document.querySelector(".channel-icons").innerHTML = `<div class="channelicon" data-img-for="dr1.dr.dk" style="height: 46px;"><img src="../images/dr1.dr.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="dr2.dr.dk" style="height: 46px;"><img src="../images/dr2.dr.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="dr3.dr.dk" style="height: 46px;"><img src="../images/dr3.dr.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="tv2.dk" style="height: 46px;"><img src="../images/tv2.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="zulu.tv2.dk" style="height: 46px;"><img src="../images/zulu.tv2.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="charlie.tv2.dk" style="height: 46px;"><img src="../images/charlie.tv2.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="news.tv2.dk" style="height: 46px;"><img src="../images/news.tv2.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="tv3.dk" style="height: 46px;"><img src="../images/tv3.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="puls.tv3.dk" style="height: 46px;"><img src="../images/puls.tv3.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="tv3plus.dk" style="height: 46px;"><img src="../images/tv3plus.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="dk4.dk" style="height: 46px;"><img src="../images/dk4.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="kanal4.dk" style="height: 46px;"><img src="../images/kanal4.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="kanal5.dk" style="height: 46px;"><img src="../images/kanal5.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="6-eren.dk" style="height: 46px;"><img src="../images/6-eren.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="canal9.dk" style="height: 46px;"><img src="../images/canal9.dk.png" width="40" height="40"></div>`;
        } else {
            dom.window.document.querySelector(".timeDesktop").innerHTML = `<div class="timeonday" style="left: 0px;">0:00</div><div class="timeonday" style="left: 110px;">0:30</div><div class="timeonday" style="left: 220px;">1:00</div><div class="timeonday" style="left: 330px;">1:30</div><div class="timeonday" style="left: 440px;">2:00</div><div class="timeonday" style="left: 550px;">2:30</div><div class="timeonday" style="left: 660px;">3:00</div><div class="timeonday" style="left: 770px;">3:30</div><div class="timeonday" style="left: 880px;">4:00</div><div class="timeonday" style="left: 990px;">4:30</div><div class="timeonday" style="left: 1100px;">5:00</div><div class="timeonday" style="left: 1210px;">5:30</div><div class="timeonday" style="left: 1320px;">6:00</div><div class="timeonday" style="left: 1430px;">6:30</div><div class="timeonday" style="left: 1540px;">7:00</div><div class="timeonday" style="left: 1650px;">7:30</div><div class="timeonday" style="left: 1760px;">8:00</div><div class="timeonday" style="left: 1870px;">8:30</div><div class="timeonday" style="left: 1980px;">9:00</div><div class="timeonday" style="left: 2090px;">9:30</div><div class="timeonday" style="left: 2200px;">10:00</div><div class="timeonday" style="left: 2310px;">10:30</div><div class="timeonday" style="left: 2420px;">11:00</div><div class="timeonday" style="left: 2530px;">11:30</div><div class="timeonday" style="left: 2640px;">12:00</div><div class="timeonday" style="left: 2750px;">12:30</div><div class="timeonday" style="left: 2860px;">13:00</div><div class="timeonday" style="left: 2970px;">13:30</div><div class="timeonday" style="left: 3080px;">14:00</div><div class="timeonday" style="left: 3190px;">14:30</div><div class="timeonday" style="left: 3300px;">15:00</div><div class="timeonday" style="left: 3410px;">15:30</div><div class="timeonday" style="left: 3520px;">16:00</div><div class="timeonday" style="left: 3630px;">16:30</div><div class="timeonday" style="left: 3740px;">17:00</div><div class="timeonday" style="left: 3850px;">17:30</div><div class="timeonday" style="left: 3960px;">18:00</div><div class="timeonday" style="left: 4070px;">18:30</div><div class="timeonday" style="left: 4180px;">19:00</div><div class="timeonday" style="left: 4290px;">19:30</div><div class="timeonday" style="left: 4400px;">20:00</div><div class="timeonday" style="left: 4510px;">20:30</div><div class="timeonday" style="left: 4620px;">21:00</div><div class="timeonday" style="left: 4730px;">21:30</div><div class="timeonday" style="left: 4840px;">22:00</div><div class="timeonday" style="left: 4950px;">22:30</div><div class="timeonday" style="left: 5060px;">23:00</div><div class="timeonday" style="left: 5170px;">23:30</div><div class="timeonday" style="left: 5280px;">0:00</div><div class="timeonday" style="left: 5390px;">0:30</div><div class="timeonday" style="left: 5500px;">1:00</div><div class="timeonday" style="left: 5610px;">1:30</div><div class="timeonday" style="left: 5720px;">2:00</div><div class="timeonday" style="left: 5830px;">2:30</div><div class="timeonday" style="left: 5940px;">3:00</div><div class="timeonday" style="left: 6050px;">3:30</div><div class="timeonday" style="left: 6160px;">4:00</div><div class="timeonday" style="left: 6270px;">4:30</div><div class="timeonday" style="left: 6380px;">5:00</div>`;
            dom.window.document.querySelector(".timeMobile").style.display = "none";
            dom.window.document.querySelector(".channel-icons").innerHTML = `<div class="channelicon" data-img-for="dr1.dr.dk" style="height: 62px;"><img src="../images/dr1.dr.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="dr2.dr.dk" style="height: 62px;"><img src="../images/dr2.dr.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="dr3.dr.dk" style="height: 62px;"><img src="../images/dr3.dr.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="tv2.dk" style="height: 62px;"><img src="../images/tv2.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="zulu.tv2.dk" style="height: 62px;"><img src="../images/zulu.tv2.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="charlie.tv2.dk" style="height: 62px;"><img src="../images/charlie.tv2.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="news.tv2.dk" style="height: 62px;"><img src="../images/news.tv2.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="tv3.dk" style="height: 62px;"><img src="../images/tv3.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="puls.tv3.dk" style="height: 62px;"><img src="../images/puls.tv3.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="tv3plus.dk" style="height: 62px;"><img src="../images/tv3plus.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="dk4.dk" style="height: 62px;"><img src="../images/dk4.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="kanal4.dk" style="height: 62px;"><img src="../images/kanal4.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="kanal5.dk" style="height: 62px;"><img src="../images/kanal5.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="6-eren.dk" style="height: 62px;"><img src="../images/6-eren.dk.png" width="40" height="40"></div><div class="channelicon" data-img-for="canal9.dk" style="height: 62px;"><img src="../images/canal9.dk.png" width="40" height="40"></div>`;

        }

        dom.window.document.querySelector(".days_inner").innerHTML = this.render_week();
        dom.window.document.querySelector(".now").style.left = (Math.round(Date.now() / 1000) - param.anchor) / 60 / 60 * param.timeLength + "px";

        let setScrollScriptEl = dom.window.document.createElement("script");
        const setScroll = "document.getElementsByClassName('channel-programs')[0].scrollLeft = " + ((new Date()).getHours() * param.timeLength - 50);
        setScrollScriptEl.innerHTML = `${setScroll}; requestAnimationFrame(()=>{${setScroll}})`;
        let ensureWidthEl = dom.window.document.createElement("div");
        ensureWidthEl.style.width = (param.timeLength * 24 * param.weeklength) + "px";
        ensureWidthEl.style.height = ".01px";
        dom.window.document.querySelector(".channel-programs").prepend(setScrollScriptEl);
        dom.window.document.querySelector(".channel-programs").prepend(ensureWidthEl);

        let date = new Date();
        let key = date.getFullYear() + "-" + this.addZero(date.getMonth() + 1) + "-" + this.addZero(date.getDate());
        if (this.dataKey !== key || this.data === false) {
            await new Promise((resolve, reject) => {
                this.dataChange.once("change", resolve);
                parentPort.postMessage([{
                    name: "getData",
                    data: {
                        channels: defaultChannels,
                        dates: [key]
                    }
                }]);
            });
            this.dataKey = key;
        }
        let channelData = this.data;


        let firstRenderChannelMarkup = this.firstRender(
            channelData,
            defaultChannels,
            param,
            key
        );
        dom.window.document.querySelector(".channels").innerHTML = firstRenderChannelMarkup.markup;

        return {
            page: minify(dom.serialize(), {
                collapseWhitespace: true,
                minifyCSS: true
            }),
            missingPrograms: JSON.stringify(firstRenderChannelMarkup.unrenderedPrograms),
            renderingKey
        }
    }

    addZero(nr) {
        if (nr < 10) {
            return "0" + nr;
        }
        return nr;
    }

    render_week() {
        let days = (() => {
            const weekDayName = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
            let list = [];
            let date = new Date();

            for (let i = 0; i < 7; i++) {
                list.push(weekDayName[date.getDay()] + " " + date.getDate() + ".");
                date.setDate(date.getDate() + 1);
            }
            return list;
        })();

        let html = "";
        days.forEach((day, index) => {
            if (index === 0) {
                html += `<span class="focus">I dag</span>`
            } else {
                html += `<span>${ day }</span>`
            }
        });
        return html;
    }


    firstRender(data, channels, param, key) {
        let html = "";
        let unrenderedPrograms = {};

        let renderbox = false;
        if (param.partial) {
            renderbox = {
                start: param.anchor + ((new Date()).getHours() + param.partial[0]) * 3600,
                end: param.anchor + ((new Date()).getHours() + param.partial[1]) * 3600
            };
        }

        let fullWidth = param.timeLength * 24 * param.weeklength;
        let fullHeight = param.programHeight * channels.length;
        let time = Math.round(Date.now() / 1000);

        html += '<div style="width: ' + fullWidth + 'px; height: ' + fullHeight + 'px" class="day" data-day-wrapper="' + key + '"><div class="day_inner">';
        channels.forEach((channel, channelIndex) => {
            html += `<div class="programms" data-channel="${channel}" style="height:${param.programHeight}px;">`;
            if (typeof data[channel] !== "undefined") {
                unrenderedPrograms[channel] = {};

                Object.keys(data[channel]).forEach(day => {
                    unrenderedPrograms[channel][day] = [];

                    data[channel][day].forEach((program, programIndex) => {
                        if (renderbox === false || (program[1] < renderbox.end && program[2] > renderbox.start)) {
                            html += this.renderProgram(program, day, channel, programIndex, param, time);
                            unrenderedPrograms[channel][day].push(false)
                        } else {
                            unrenderedPrograms[channel][day].push(program)
                        }
                    });
                });
            }
            html += `</div>`;
        });
        html += "</div></div>";

        return {markup: html, unrenderedPrograms}

    }


    renderProgram(program, day, channel, index, param, time) {
        return `
            <div class="program-wrapper ${ program[2] < time ? "program-in-the-past" : "" }"
                style="
                    left: ${(program[1] - param.anchor) / 60 / 60 * param.timeLength}px;
                    width: ${(program[2] - program[1]) / 60 / 60 * param.timeLength}px;
                    height: ${param.programHeight}px;"                         
                data-dato="${day}"
                data-channel="${channel}"
                data-programno="${index}"
                data-start="${program[1]}"
                data-end="${program[2]}">
                
                <div class="program"
                    title="${ program[0] } - ${ this.timeOnDay(program[1]) } - ${ this.timeOnDay(program[2]) }"
                    style="padding: ${ param.padding }px">
                    
                    <div class="program-title">${ program[0] }</div>
                    <div class="program-time">${ this.timeOnDay(program[1]) } - ${ this.timeOnDay(program[2]) }</div>
                </div>
            
            </div>`;
    }

    timeOnDay(time) {
        let date = new Date(time * 1000);
        let leadingZero = (time) => {
            if (time < 10) {
                return "0" + time
            }
            return time
        };

        return leadingZero(date.getHours()) + ":" + leadingZero(date.getMinutes())
    }

}

let serverRender = new ServerRenderWorker();


async function renderAndSend() {
    await serverRender.render();
    parentPort.postMessage([{
        name: "rendered",
        data: {
            renderedPhonePage: serverRender.renderedPhonePage,
            phonePageMissingDiagrams: serverRender.phonePageMissingPrograms,
            phoneRenderingKey: serverRender.phoneRenderingKey,
            renderedDesktopPage: serverRender.renderedDesktopPage
        }
    }]);
}


let fiveMin = (1000 * 60 * 5);
let timeIn5MinChunk = Date.now() / fiveMin;
let timeTill5Min = (timeIn5MinChunk - Math.ceil(timeIn5MinChunk)) * fiveMin * -1;

setTimeout(renderAndSend, timeTill5Min);


parentPort.on("message", tasks => {
    for (let task of tasks) {
        switch (task.name) {
            case "getData":
                serverRender.setData(task.data);
                break;

            case "setData":
                serverRender.setData(task.data.programData, task.data.key);
                break;

            case "setTemplate":
                serverRender.template = task.data;
                break;

            case "render":
                renderAndSend();
                break;
        }
    }
});