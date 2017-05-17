/**
 * Created by Benjamin on 15-05-2017.
 */

export default class Responsive {

    constructor(app) {
        this._app = app;

        this.onUpdate = ()=>{};

        this.default = {
            mobileTimeLength: 140,
            desktopTimeLength: 220,
            mobileProgramHeight: 46,
            desktopProgramHeight: 62,
            mobilePadding: 2,
            desktopPadding: 9
        };

        this.timeLength = this.default.desktopTimeLength;
        this.programHeight = this.default.desktopProgramHeight;
        this.padding = 2;

        this.triggerUpdate = this.triggerUpdate.bind(this);
        this.checkSize = this.checkSize.bind(this);
        this.resizeElements = this.resizeElements.bind(this);
        this.resizeChannelIcons = this.resizeChannelIcons.bind(this);

        window.addEventListener("resize", this.checkSize);
        this.checkSize();
    }

    triggerUpdate(){
        this.onUpdate(window.innerWidth > 700);
    }

    checkSize() {

        this.resizeElements();


        if (window.innerWidth > 700) {
            this.timeLength = this.default.desktopTimeLength;
            this.programHeight = this.default.desktopProgramHeight;
            this.padding = 9;

        } else {
            this.timeLength = this.default.mobileTimeLength;
            this.programHeight = this.default.mobileProgramHeight;
            this.padding = 2;
        }

        this.onUpdate(window.innerWidth > 700);

        this.resizeChannelIcons();

    }

    resizeElements() {

        let elements = document.getElementsByClassName("program-wrapper");

        Array.from(elements).forEach(element => {
            let start = parseInt(element.getAttribute("data-start")),
                end = parseInt(element.getAttribute("data-end"));

            if (window.innerWidth > 700) {
                element.style.left = (start-this._app.anchor)/60/60*this.default.desktopTimeLength + "px";
                element.style.width = (end-start)/60/60*this.default.desktopTimeLength + "px";

                if(element.offsetHeight === this.default.mobileProgramHeight) {// todo trigger reflow
                    element.style.height = this.default.desktopProgramHeight+"px";

                    element.querySelector(".program").style.padding = this.default.desktopPadding + "px";
                }
            } else {
                element.style.left = (start-this._app.anchor)/60/60*this.default.mobileTimeLength + "px";
                element.style.width = (end-start)/60/60*this.default.mobileTimeLength + "px";


                if(element.offsetHeight === this.default.desktopProgramHeight) {// todo trigger reflow
                    element.style.height = this.default.mobileProgramHeight+"px";

                    element.querySelector(".program").style.padding = this.default.mobilePadding + "px";
                }
            }
        });
    }

    resizeChannelIcons(){
        let elements = document.querySelectorAll(".channelicon, .programms");
        Array.from(elements,  (element) => {
            element.style.height = this.programHeight + "px";
        })
    }
}