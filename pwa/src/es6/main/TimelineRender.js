/**
 * Created by Benjamin on 15-05-2017.
 */

export default class TimelineRender {
    constructor(app) {
        this._app = app;
        this.dayBlockElements = [];
        this.dayBlockElementsReversed = [];

        this.addEventListener = this.addEventListener.bind(this);
        this.updateDayBlock = this.updateDayBlock.bind(this);
        this.addMissingSetup = this.addMissingSetup.bind(this);

        this._channelsEl = document.getElementsByClassName("channels")[0];
        this._channelsWrapperEl = document.getElementsByClassName("channel-programs")[0];

        this.onProgramClick = () => {
        };


        this.updateDayBlock();
        this._app.responsive.onUpdate(this.updateDayBlock);
    }


    updateDayBlock() {

        this.dayBlockElements.forEach(element => {
            element.style.width = this._app.responsive.fullWidth + "px";
            element.style.height = this._app.responsive.fullWidth + "px";
        })

    }


    updateChannelList(channels) {

        this.dayBlockElements.forEach(dayElement => {

            if(dayElement.querySelector(".day_inner").innerHTML !== "") {
                let channelHtml = "";
                let channelContent = [];

                Array.from(dayElement.getElementsByClassName("programms")).forEach(element => {
                    channelContent[element.getAttribute("data-channel")] = element.innerHTML;
                });
                channels.forEach(channel => {
                    channelHtml += `<div class="programms" data-channel="${channel}" style="height:${this._app.responsive.programHeight}px;">
                         ${ (typeof channelContent[channel] !== "undefined" ? channelContent[channel] : "") }
                         </div>`;
                });
                dayElement.querySelector(".day_inner").innerHTML = channelHtml;
            }

        })

    }


    firstRender(data, channels) {
        let unrenderedPrograms = [];
        let unrenderedChannels = [];

        let renderbox = this._app.responsive.getRenderBox();

        let html = "";


        html += '<div style="width: ' + this._app.responsive.fullWidth + 'px; height: ' + this._app.responsive.fullHeight + 'px" class="day" data-day-wrapper="' + this._app.week[0].url + '"><div class="day_inner">';

        channels.forEach((channel, channelIndex) => {
            if (typeof data[channel] !== "undefined") {
                if (channelIndex < renderbox.channels) {
                    html += `<div class="programms" data-channel="${channel}" style="height:${this._app.responsive.programHeight}px;">`;
                    unrenderedPrograms[channel] = [];

                    Object.keys(data[channel]).forEach(day => {

                        unrenderedPrograms[channel][day] = [];

                        data[channel][day].forEach((program, programIndex) => {
                            if (channelIndex + 1 <= renderbox.channels && program[1] < renderbox.end && program[2] > renderbox.start) {
                                html += this._renderProgram(program, day, channel, programIndex);
                                unrenderedPrograms[channel][day].push(false)
                            } else {
                                unrenderedPrograms[channel][day].push(program)
                            }
                        });

                    });
                    html += `</div>`;
                } else {
                    unrenderedChannels[channel] = data[channel];
                }
            }
        });

        html += "</div></div>";


        this._channelsEl.innerHTML = html;


        return [unrenderedPrograms, unrenderedChannels];

    }

    addMissingSetup() {
        if (this._app.renderYesterday !== false) {
            this._channelsEl.innerHTML =
                '<div style="width: ' + this._app.responsive.fullWidth + 'px; height: ' + this._app.responsive.fullHeight + 'px" class="day" data-day-wrapper="' + this._app.renderYesterday + '"><div class="day_inner"></div></div>'
                + this._channelsEl.innerHTML;
        }
        let lastDays = "";
        for (let {url: day} of this._app.week.slice(1)) {
            lastDays += '<div style="width: ' + this._app.responsive.fullWidth + 'px; height: ' + this._app.responsive.fullHeight + 'px" class="day" data-day-wrapper="' + day + '"><div class="day_inner"></div></div>';
        }
        lastDays += '<div style="width: ' + this._app.responsive.fullWidth + 'px; height: ' + this._app.responsive.fullHeight + 'px" data-day-wrapper="eventcatch"></div>';

        this._channelsEl.innerHTML += lastDays;

        this.dayBlockElements = Array.from(document.querySelectorAll("[data-day-wrapper].day"));
        this.dayBlockElementsReversed = Array.from(this.dayBlockElements).reverse();


    }

    addMissingProgramsRender(unrenderedPrograms) {
        Object.keys(unrenderedPrograms).forEach(channel => {
            Object.keys(unrenderedPrograms[channel]).forEach(day => {

                let html = "";
                unrenderedPrograms[channel][day].forEach((program, index) => {
                    //noinspection CssInvalidPropertyValue
                    if (program !== false) {
                        html += this._renderProgram(program, day, channel, index);
                    }
                });

                document.querySelector("[data-day-wrapper='" + day + "'] .programms[data-channel='" + channel + "']").innerHTML += html;
            })
        });
    }

    addElementsRender(data, removeExistingContent) {
        // todo can only eat 1 day at once
        let day = Object.keys(data[Object.keys(data)[0]])[0];

        // console.log("render day", day);
        // console.timeStamp(day);

        let html = "";

        Object.keys(data).forEach(channel => {

            html += `<div class="programms" data-channel="${channel}" style="height:${this._app.responsive.programHeight}px;">`;

            data[channel][day].forEach((program, index) => {
                //noinspection CssInvalidPropertyValue
                if (this._app.anchor < program[2]) {
                    html += this._renderProgram(program, day, channel, index);
                }
            });

            html += `</div>`;
        });

        if(removeExistingContent) {
            document.querySelector("[data-day-wrapper='" + day + "'] .day_inner").innerHTML = html;
        }else{
            document.querySelector("[data-day-wrapper='" + day + "'] .day_inner").innerHTML += html;
        }
    }


    _renderProgram(program, day, channel, index) {
        return `
            <div class="program-wrapper ${ program[2] < this._app.ongoingTime.time ? "program-in-the-past" : "" }"
                style="
                    left: ${(program[1] - this._app.anchor) / 60 / 60 * this._app.responsive.timeLength}px;
                    width: ${(program[2] - program[1]) / 60 / 60 * this._app.responsive.timeLength}px;
                    height: ${this._app.responsive.programHeight}px;"                         
                data-dato="${day}"
                data-channel="${channel}"
                data-programno="${index}"
                data-start="${program[1]}"
                data-end="${program[2]}">
                
                <div class="program"
                    title="${ program[0] } - ${ TimelineRender.timeOnDay(program[1]) } - ${ TimelineRender.timeOnDay(program[2]) }"
                    style="padding: ${ this._app.responsive.padding }px">
                    
                    <div class="program-title">${ program[0] }</div>
                    <div class="program-time">${ TimelineRender.timeOnDay(program[1]) } - ${ TimelineRender.timeOnDay(program[2]) }</div>
                </div>
            
            </div>`;
    }


    addEventListener() {
        let inProgram = (element) => {
            if (element.classList.contains("program-wrapper")) {
                return [
                    element.getAttribute("data-programno"),
                    element.getAttribute("data-dato"),
                    element.getAttribute("data-channel"),
                    element.querySelector(".program-title").innerHTML,
                    element.querySelector(".program-time").innerHTML
                ];
            }
            if (element.parentElement === null) {
                return false;
            }
            return inProgram(element.parentElement);
        };

        let eventCatcher = document.querySelector('[data-day-wrapper="eventcatch"]');
        eventCatcher.addEventListener("click", event => {
            let found = false;

            eventCatcher.style.pointerEvents = "none";

            this.dayBlockElementsReversed.forEach(day => {
                if(found !== false) {
                    return;
                }
                let id = inProgram(document.elementFromPoint(event.clientX, event.clientY));
                if (id !== false) {
                    found = id
                }

                day.style.pointerEvents = "none";
            });

            this.dayBlockElements.forEach(day => {
                day.style.pointerEvents = "auto";
            });

            eventCatcher.style.pointerEvents = "auto";

            if (found !== false) {
                this.onProgramClick(found)
            }

        })

    }


    static timeOnDay(time) {
        let date = new Date(time * 1000);
        let leadingZerro = (time) => {
            if (time < 10) {
                return "0" + time
            }
            return time
        };

        return leadingZerro(date.getHours()) + ":" + leadingZerro(date.getMinutes())
    }
}