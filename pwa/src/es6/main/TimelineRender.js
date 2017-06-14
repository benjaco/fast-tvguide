/**
 * Created by Benjamin on 15-05-2017.
 */

export default class TimelineRender {
    constructor(app) {
        this._app = app;

        this.addEventListener = this.addEventListener.bind(this);

        this._channelsEl = document.getElementsByClassName("channels")[0];

        this.onProgramClick = () => {
        };


        this._renderedDays = [];

        this.addEventListener()
    }


    updateChannelList(channels) {
        let channelHtml = "";
        let channelContent = [];

        Array.from(this._channelsEl.getElementsByClassName("programms")).forEach(element => {
            channelContent[element.getAttribute("data-channel")] = element.innerHTML;
        });

        channels.forEach(channel => {
            channelHtml += `<div class="programms" data-channel="${channel}" style="height:${this._app.responsive.programHeight}px;">
                                ${ (typeof channelContent[channel] !== "undefined" ? channelContent[channel] : "") }
                            </div>`;
        });

        this._channelsEl.innerHTML = channelHtml;
    }


    firstRender(data, channels) {
        let renderbox = this._app.responsive.getRenderBox();
        let unrenderedPrograms = [];
        let unrenderedChannels = [];
        let html = "";
        channels.forEach((channel, channelIndex) => {
            html += `<div class="programms" data-channel="${channel}" style="height:${this._app.responsive.programHeight}px;">`;
            if (typeof data[channel] !== "undefined") {
                if (channelIndex < renderbox.channels) {
                    unrenderedPrograms[channel] = [];
                    Object.keys(data[channel]).forEach(day => {

                        this._renderedDays.push(channel + "-" + day);
                        unrenderedPrograms[channel][day] = [];

                        html += '<div data-day-wrapper="'+day+'">';

                        data[channel][day].forEach((program, programIndex) => {
                            if (channelIndex + 1 <= renderbox.channels && program[1] < renderbox.end && program[2] > renderbox.start) {

                                html += this._renderProgram(program, day, channel, programIndex);

                                unrenderedPrograms[channel][day].push(false)
                            } else {
                                unrenderedPrograms[channel][day].push(program)
                            }
                        });

                        html += "</div>"
                    })
                } else {
                    unrenderedChannels[channel] = data[channel];
                }
            }
            html += `</div>`;
        });

        this._channelsEl.innerHTML = html;

        return [unrenderedPrograms, unrenderedChannels];
    }

    addMissingProgramsRender(unrenderedPrograms) {
        Object.keys(unrenderedPrograms).forEach(channel => {
            Object.keys(unrenderedPrograms[channel]).forEach(day => {
                this._renderedDays.push(channel + "-" + day);

                let html = "";
                unrenderedPrograms[channel][day].forEach((program, index) => {
                    //noinspection CssInvalidPropertyValue
                    if (program !== false) {
                        html += this._renderProgram(program, day, channel, index);
                    }
                });

                document.querySelector(".programms[data-channel='" + channel + "'] [data-day-wrapper='"+day+"']").innerHTML += html;
            })
        });
    }

    addElementsRender(data) {
        Object.keys(data).forEach(channel => {
            Object.keys(data[channel]).forEach(day => {
                if (this._renderedDays.indexOf(channel + "-" + day) > -1) {
                    return;
                }
                this._renderedDays.push(channel + "-" + day);

                let html = '<div data-day-wrapper="'+day+'">';

                data[channel][day].forEach((program, index) => {
                    //noinspection CssInvalidPropertyValue
                    if(this._app.anchor < program[1]){
                        html += this._renderProgram(program, day, channel, index);
                    }
                });
                html += "<div>";
                document.querySelector(".programms[data-channel='" + channel + "']").innerHTML += html;

            })
        });
    }

    updateDay(data){
        Object.keys(data).forEach(channel => {
            Object.keys(data[channel]).forEach(day => {
                if (this._renderedDays.indexOf(channel + "-" + day) > -1) {
                    let html = '';

                    data[channel][day].forEach((program, index) => {
                        //noinspection CssInvalidPropertyValue
                        html += this._renderProgram(program, day, channel, index);
                    });

                    document.querySelector(".programms[data-channel='" + channel + "'] [data-day-wrapper='"+day+"']").innerHTML = html;
                }
            })
        });
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
        this._channelsEl.addEventListener("click", (e) => {
            let id = inProgram(e.target);
            if (id !== false) {
                this.onProgramClick(id)
            }
        });

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