/**
 * Created by Benjamin on 15-05-2017.
 */

export default class TimelineRender{
    constructor(app) {
        this._app = app;


        this._channelIconsEl = document.getElementsByClassName("channel-icons")[0];

        this._renderedDays = [];

    }
    render(data, ancher){
        Object.keys(data).forEach(channel => {
            Object.keys(data[channel]).forEach(day => {
                if(this._renderedDays.indexOf(channel+"-"+day) > -1) {
                    return;
                }
                this._renderedDays.push(channel + "-" + day);

                let html = "";

                data[channel][day].forEach((program, index) => {
                    //noinspection CssInvalidPropertyValue
                    html += `
<div class="program-wrapper ${ program[2] < this._app.ongoingTime.time ? "program-in-the-past" : "" }" style="left: ${(program[1]-ancher)/60/60*this._app.responsive.timeLength}px; 
                                    width: ${(program[2]-program[1])/60/60*this._app.responsive.timeLength}px; 
                                    height: ${this._app.responsive.programHeight}px"
                                    data-dato="${day}"
                                    data-channel="${channel}"
                                    data-programno="${index}"
                                    data-start="${program[1]}"
                                    data-end="${program[2]}">
    <div class="program" 
                    title="${ program[0] } - ${ TimelineRender.timeOnDay(program[1]) } - ${ TimelineRender.timeOnDay(program[2]) }"
                    style="padding: ${ this._app.responsive.padding }px">
        <div class="title">${ program[0] }</div>
        <div class="time">${ TimelineRender.timeOnDay(program[1]) } - ${ TimelineRender.timeOnDay(program[2]) }</div>
    </div>

</div>`;
                });
                document.querySelector(".programms[data-channel='" + channel + "']").innerHTML += html;

            })
        })
    }

    static timeOnDay(time){
        let date = new Date(time * 1000);
        let leadingZerro = (time) => {
            if (time< 10) {
                return "0"+time
            }
            return time
        };

        return leadingZerro(date.getHours()) + ":"+leadingZerro(date.getMinutes())
    }
}