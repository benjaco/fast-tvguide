/**
 * Created by Benjamin on 15-05-2017.
 */

export default class Responsive {

    constructor(app) {
        this._app = app;
        this.width = window.innerWidth;
        this.height = window.innerHeight;



        this._onUpdate = [];
        this.onUpdate = fn => this._onUpdate.push(fn);

        this.default = {
            mobileTimeLength: 140,
            desktopTimeLength: 220,
            mobileProgramHeight: 46,
            desktopProgramHeight: 62,
            mobilePadding: 2,
            desktopPadding: 9
        };

        this.triggerUpdate = this.triggerUpdate.bind(this);
        this.checkSize = this.checkSize.bind(this);
        this.resizeElements = this.resizeElements.bind(this);
        this.resizeChannelIcons = this.resizeChannelIcons.bind(this);

        window.addEventListener("resize", () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.checkSize();
        });

        this.checkSize(true);


        this.fullWidth = this.timeLength * 24 * this._app.week.length;
        this.fullHeight = this.programHeight * this._app.channelList.channels.length;
    }

    triggerUpdate() {
        this._onUpdate.map( fn => fn(this.width > 700) );
    }

    checkSize(skipUpdate) {
        let oldMode = this.mode;

        if (this.width > 700) {
            this.timeLength = this.default.desktopTimeLength;
            this.programHeight = this.default.desktopProgramHeight;
            this.padding = 9;
            this.mode = "desktop";
        } else {
            this.timeLength = this.default.mobileTimeLength;
            this.programHeight = this.default.mobileProgramHeight;
            this.padding = 2;
            this.mode = "mobile";
        }

        if (oldMode !== this.mode && skipUpdate !== true) {
            this.fullWidth = this.timeLength * 24 * this._app.week.length;
            this.fullHeight = this.programHeight * this._app.channelList.channels.length;


            this.triggerUpdate();

            this.resizeElements();
            this.resizeChannelIcons();
        }


    }

    resizeElements() {

        let elements = document.getElementsByClassName("program-wrapper");

        Array.from(elements).forEach(element => {
            let start = parseInt(element.getAttribute("data-start")),
                end = parseInt(element.getAttribute("data-end"));

            element.style.left = (start - this._app.anchor) / 60 / 60 * this.timeLength + "px";
            element.style.width = (end - start) / 60 / 60 * this.timeLength + "px";
            element.style.height = this.programHeight + "px";
            element.querySelector(".program").style.padding = this.padding + "px";

        });
    }

    resizeChannelIcons() {
        let elements = document.querySelectorAll(".channelicon, .programms");
        Array.from(elements, (element) => {
            element.style.height = this.programHeight + "px";
        })
    }

    getRenderBox() {
        let channels = Math.ceil((this.height - 130) / this.programHeight);
        let start = parseInt( ((new Date()).getHours() - (50 / this.timeLength)) * 3600 + this._app.anchor);
        let end = parseInt( (this.width - 76) / this.timeLength * 3600 + start);

        return {
            channels,
            start,
            end
        }
    }
}