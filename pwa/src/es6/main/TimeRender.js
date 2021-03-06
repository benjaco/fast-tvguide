/**
 * Created by Benjamin on 15-05-2017.
 */

export default class TimeRender{

    constructor(app, mode) {
        this._app = app;

        this._timeDesktopEl = document.getElementsByClassName("timeDesktop")[0];
        this._timeMobileEl = document.getElementsByClassName("timeMobile")[0];


        if (mode === "desktop") {
            this._timeMobileEl.style.display = "none";
            this._timeDesktopEl.style.display = "";
        } else {
            this._timeMobileEl.style.display = "";
            this._timeDesktopEl.style.display = "none";
        }

    }

    renderDays(days){
        let htmlDesktop = "",
            htmlMobile = "";

        for (let i = 0; i < days; i++) {
            let [desktopChunk, mobileChunck] = this._addDay(i);
            htmlDesktop += desktopChunk;
            htmlMobile += mobileChunck
        }

        this._timeDesktopEl.innerHTML = htmlDesktop;
        this._timeMobileEl.innerHTML = htmlMobile;
    }

    showDesktopTimeline(){
        this._timeMobileEl.style.display = "none";
        this._timeDesktopEl.style.display = "block";
    }
    showMobileTimeline(){
        this._timeMobileEl.style.display = "block";
        this._timeDesktopEl.style.display = "none";
    }

    _addDay(dayNo){
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

        return [htmlDesktop, htmlMobile]
    }
    static floatToTime(time) {
        if( time % 2 === 1 ) {
            return Math.floor(time / 2) + ":30";
        }else{
            return (time / 2) + ":00";
        }
    }

}