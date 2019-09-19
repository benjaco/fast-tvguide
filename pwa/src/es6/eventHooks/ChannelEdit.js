/**
 * Created by Benjamin on 17-05-2017.
 */
import LoadScript from "../main/LoadScript"
class ChannelEdit {

    constructor(app) {
        this._app = app;

        this.onUpdate = ()=>{};

        this._buttonEl = document.getElementById("change-channels");
        this._overlayEl = document.getElementsByClassName("overlay")[0];
        this._slideInEl = document.getElementsByClassName("kanal-valg")[0];
        this._channelListEl = this._slideInEl.querySelector(".channel-list");

        this.isRenderd = false;

        this.addEventListener = this.addEventListener.bind(this);
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.render = this.render.bind(this);
        this.processChanges = this.processChanges.bind(this);

        this.addEventListener()
    }

    render() {
        let html = "";
        this._app.channelList.channels.forEach(channelId => {
            html += `<div class="kanal">
                <input type="checkbox" data-valgt-kanal="${channelId}" checked>
                ${this._app.channelNames[channelId]}
            </div>`;
        });

        Object.keys(this._app.channelNames).forEach(channelId => {
            if (this._app.channelList.channels.indexOf(channelId) === -1) {
                html += `<div class="kanal">
                    <input type="checkbox" data-valgt-kanal="${channelId}">
                    ${this._app.channelNames[channelId]}
                </div>`;
            }
        });
        this._channelListEl.innerHTML = html;

        LoadScript("slip.min.js").then(_=>{
            new Slip(this._channelListEl);
            this._channelListEl.addEventListener('slip:beforeswipe', function(e) {
                e.preventDefault();
            });


            this._channelListEl.addEventListener('slip:reorder', function(e) {
                // e.target list item reordered.
                e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);

            });
        })


    }

    addEventListener() {
        this._overlayEl.addEventListener("click", () => this.close());
        this._buttonEl.addEventListener("click", () => this.open());
    }

    close() {
        this._slideInEl.classList.remove("on");
        this._overlayEl.classList.remove("on");
        setTimeout(() => this._overlayEl.style.display = "none", 500);

        let change = this.processChanges();
        if (change) {
            this.onUpdate(change);
        }
    }

    open() {
        if (!this.isRenderd) {
            this.render();
            this.isRenderd = true;
        }

        this._slideInEl.classList.add("on");
        this._overlayEl.style.display = "block";
        this._overlayEl.classList.add("on");

    }

    processChanges() {
        let newList = Array.from(this._channelListEl.querySelectorAll("[data-valgt-kanal]:checked")).map(el => el.getAttribute("data-valgt-kanal"));

        if(this._app.channelList.channels.join(",") === newList.join(",")) {
            return false;
        }

        return newList;
    }
}

window.ChannelEdit = ChannelEdit;