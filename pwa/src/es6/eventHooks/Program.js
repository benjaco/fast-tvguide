/**
 * Created by Benjamin on 16-05-2017.
 */


class Program {

    constructor() {

        this.open = false;
        this._programInfoEl = document.querySelector(".program_info_outer");

        this.close = this.close.bind(this);
        this.show = this.show.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);

        this.addEventListeners();

    }

    addEventListeners() {
        document.querySelector(".closepopup").addEventListener("click", () => {
            this.close()
        })

    }

    openPopup() {
        this.open = true;
        this._programInfoEl.style.transform = "translateY(0px)";
    }

    close() {
        this.open = false;

        this._programInfoEl.scroll({top: 0, left: 0, behavior: 'smooth' });
        this._programInfoEl.style.transform = "translateY(310px)";
    }

    show([programmNo, dato, channel, title, time]) {
        if (!this.open) {
            this.openPopup()
        }
        this._programInfoEl.querySelector('.channellogo').src = `../images/${channel}.png`;
        this._programInfoEl.querySelector('.title-text').textContent = title;
        this._programInfoEl.querySelector('.time-text').textContent = time;
        this._programInfoEl.querySelector('.desc').textContent = "";
        this._programInfoEl.querySelector('.involved').textContent = "";
        this._programInfoEl.querySelector('.onscreen').textContent = "";
        this._programInfoEl.querySelector('.quality').style.display = "none";
        this._programInfoEl.classList.remove("tall-header");

        fetch("../all_info?channel=" + channel + "&date=" + dato + "&no=" + programmNo)
            .then(r => r.json())
            .then((data) => {

                if (data.program.episodeNum) {
                    if (data.program.episodeNum.onscreen) {
                        this._programInfoEl.querySelector('.onscreen').textContent = data.program.episodeNum.onscreen;
                        this._programInfoEl.classList.add("tall-header");
                    }
                }
                if (data.program.video) {
                    if (data.program.video.quality) {
                        this._programInfoEl.querySelector('.quality').style.display = "inline";
                        this._programInfoEl.querySelector('.quality').textContent = data.program.video.quality;
                    }
                }


                if (data.program.desc) {
                    if (data.program.desc.da) {
                        this._programInfoEl.querySelector('.desc').textContent = data.program.desc.da;
                    }
                }

                if (data.program.credits) {
                    this._programInfoEl.querySelector('.involved').innerHTML = `
                    ${(data.program.credits.actor ? `
                        <p style="font-weight: bold; padding-top: 5px;">Actors</p>
                        ${data.program.credits.actor.map(actor => {
                        if (actor.name && actor.role) {
                            return `<p>${actor.name} <span style="font-style: italic">som</span> ${actor.role}</p>`
                        } else if (actor.name) {
                            return `<p>${actor.name}</p>`
                        }
                    }).join("")}
                    ` : '')}
                    
                    ${(data.program.credits.director ? `
                        <p style="font-weight: bold; padding-top: 5px;">Director${data.program.credits.director.length > 1 ? `s` : ''}</p>
                        ${data.program.credits.director.map(director => {
                        if (director.name) {
                            return `<p>${director.name}</p>`
                        }
                    }).join("")}
                    ` : '')}
                    
                    ${(data.program.credits.writer ? `
                        <p style="font-weight: bold; padding-top: 5px;">Writer${data.program.credits.writer.length > 1 ? `s` : ''}</p>
                        ${data.program.credits.writer.map(writer => {
                        if (writer.name) {
                            return `<p>${writer.name}</p>`
                        }
                    }).join("")}
                    ` : '')}
                    `
                }
            })
    }
}

window.Program = Program;