/**
 * Created by Benjamin on 15-05-2017.
 */


export default class OngoingTime {

    constructor(app) {
        this._nowEl = document.getElementsByClassName("now")[0];
        this._app = app;

        this.update = this.update.bind(this);
        this.updateElements = this.updateElements.bind(this);
        this.updateTime = this.updateTime.bind(this);

        setTimeout(_ =>  {
            this.update();
            setInterval(
                this.update,
                1000*60
            )
        }, (1 + 60 - (new Date().getSeconds())) * 1000 );

    }
    update(){
        this.updateTime();
        this.updateElements()

    }
    updateTime(){
        this.time = Math.round(Date.now() / 1000);

        this._nowEl.style.left = (this.time - this._app.anchor) / 60 / 60 * this._app.responsive.timeLength + "px";
    }
    updateElements() {
        // console.log("Update elements");

        const channelsEl = document.getElementsByClassName("programms");
        Array.from(channelsEl).forEach(channelEl => {

            let nextProgram = channelEl.querySelector(".program-wrapper:not(.program-in-the-past)");
            if (nextProgram) {
                let endsAt = parseInt(nextProgram.getAttribute("data-end"));
                if (endsAt < this.time) {
                    nextProgram.classList.add("program-in-the-past");
                }
            }
        });
    }
}