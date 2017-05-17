/**
 * Created by Benjamin on 15-05-2017.
 */

export default class TimeRender{

    constructor(app) {
        this._app = app;

        this.renderdDaysCount = this.renderdDaysCount.bind(this);

        this._timeDesktopEl = document.getElementsByClassName("timeDesktop")[0];
        this._timeMobileEl = document.getElementsByClassName("timeMobile")[0];
        this._renderedDays = [];

        this.addDay = this.addDay.bind(this);
    }

    renderdDaysCount(){
        return this._renderedDays.length;
    }
    showDesktopTimeline(){
        this._timeMobileEl.style.display = "none";
        this._timeDesktopEl.style.display = "block";
    }
    showMobileTimeline(){
        this._timeMobileEl.style.display = "block";
        this._timeDesktopEl.style.display = "none";
    }

    addDay(dayNo){
        if(this._renderedDays.indexOf(dayNo)!==-1) {
            return;
        }
        this._renderedDays.push(dayNo);

        let htmlDesktop = "",
            htmlMobile = "";

        for (let i = 0; i<48; i++) {
            htmlDesktop +=
                `<div class="timeonday" 
                    style="left: ${(this._app.responsive.default.desktopTimeLength * (i / 2) + dayNo * 24 * this._app.responsive.default.desktopTimeLength)}px;">
                     ${TimeRender.floatToTime(i)}
                 </div>`;
            htmlMobile +=
                `<div class="timeonday" 
                    style="left: ${(this._app.responsive.default.mobileTimeLength * (i / 2) + dayNo * 24 * this._app.responsive.default.mobileTimeLength)}px;">
                     ${TimeRender.floatToTime(i)}
                 </div>`;
        }

        this._timeDesktopEl.innerHTML += htmlDesktop;
        this._timeMobileEl.innerHTML += htmlMobile;
    }
    static floatToTime(time) {
        if( time % 2 === 1 ) {
            return Math.floor(time / 2) + ":30";
        }else{
            return (time / 2) + ":00";
        }
    }

}