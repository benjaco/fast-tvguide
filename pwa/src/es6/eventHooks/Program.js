/**
 * Created by Benjamin on 16-05-2017.
 */


class Program {

    constructor() {

        this.open = false;
        this._programInfoEl = document.getElementsByClassName("program_info")[0];

        this.close = this.close.bind(this);
        this.show = this.show.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);

        this.addEventListeners();

    }

    addEventListeners() {
        document.getElementsByClassName("closepopup")[0].addEventListener("click", () => {
            this.close()
        })

    }

    openPopup() {
        this.open = true;
        this._programInfoEl.style.transform = "translateY(0px)";
    }

    close() {
        this.open = false;
        this._programInfoEl.getElementsByClassName('desc')[0].textContent = "";
        this._programInfoEl.style.transform = "translateY(200px)";
    }

    show([programmNo, dato, channel, title, time]) {
        if (!this.open) {
            this.openPopup()
        }
        this._programInfoEl.getElementsByClassName('channellogo')[0].src = `../server/data/images/${channel}.png`;
        this._programInfoEl.getElementsByClassName('title-text')[0].textContent = title;
        this._programInfoEl.getElementsByClassName('time-text')[0].textContent = time;
        this._programInfoEl.getElementsByClassName('desc')[0].textContent = "";
        this._programInfoEl.getElementsByClassName('onscreen')[0].textContent = "";
        this._programInfoEl.getElementsByClassName('quality')[0].style.display = "none";

        fetch("../server/get_all_info.php?channel=" + channel + "&date=" + dato + "&no=" + programmNo)
            .then(r => r.json())
            .then((data) => {

                if (data.program.episodeNum) {
                    if (data.program.episodeNum.onscreen) {
                        this._programInfoEl.getElementsByClassName('onscreen')[0].textContent = data.program.episodeNum.onscreen;
                    }
                }
                if (data.program.video) {
                    if (data.program.video.quality) {
                        this._programInfoEl.getElementsByClassName('quality')[0].style.display = "inline";
                        this._programInfoEl.getElementsByClassName('quality')[0].textContent = data.program.video.quality;
                    }
                }
                if (data.program.desc) {
                    if (data.program.desc.da) {
                        this._programInfoEl.getElementsByClassName('desc')[0].textContent = data.program.desc.da;
                    }
                }
            })
    }
}

window.Program = Program;