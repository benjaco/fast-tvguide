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

    show([programmNo, dato, channel]) {
        if (!this.open) {
            this.openPopup()
        }

        fetch("../server/get_all_info.php?channel=" + channel + "&date=" + dato + "&no=" + programmNo)
            .then(r => r.json())
            .then((data) => {
                if (data.program.channel) {
                    this._programInfoEl.getElementsByClassName('channellogo')[0].src = `../server/data/large_images/${data.program.channel}.png`;
                }else{
                    this._programInfoEl.getElementsByClassName('channellogo')[0].src = ``;
                }
                if (data.program.title) {
                    if (data.program.title.da) {
                        this._programInfoEl.getElementsByClassName('title-text')[0].textContent = data.program.title.da;
                    }else{
                        this._programInfoEl.getElementsByClassName('title-text')[0].textContent = "";
                    }
                }else{
                    this._programInfoEl.getElementsByClassName('title-text')[0].textContent = "";
                }
                if (data.program.episodeNum) {
                    if (data.program.episodeNum.onscreen) {
                        this._programInfoEl.getElementsByClassName('onscreen')[0].textContent = data.program.episodeNum.onscreen;
                    }else{
                        this._programInfoEl.getElementsByClassName('onscreen')[0].textContent = "";
                    }
                }else{
                    this._programInfoEl.getElementsByClassName('onscreen')[0].textContent = "";
                }
                this._programInfoEl.getElementsByClassName('time-text')[0].textContent = "";
                if (data.program.video) {
                    if (data.program.video.quality) {
                        this._programInfoEl.getElementsByClassName('quality')[0].style.display = "inline";
                        this._programInfoEl.getElementsByClassName('quality')[0].textContent = data.program.video.quality;
                    }else{
                        this._programInfoEl.getElementsByClassName('quality')[0].style.display = "none";
                    }
                }else{
                    this._programInfoEl.getElementsByClassName('quality')[0].style.display = "none";
                }
                if (data.program.desc) {
                    if (data.program.desc.da) {
                        this._programInfoEl.getElementsByClassName('desc')[0].textContent = data.program.desc.da;
                    }else{
                        this._programInfoEl.getElementsByClassName('desc')[0].textContent = "";
                    }
                }else{
                    this._programInfoEl.getElementsByClassName('desc')[0].textContent = "";
                }
            })
    }
}

window.Program = Program;