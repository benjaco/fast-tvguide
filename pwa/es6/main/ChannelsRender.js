/**
 * Created by Benjamin on 10-05-2017.
 */

export default class ChannelsRender {

    constructor(app) {
        this._app = app;
        this._channelIconsEl = document.getElementsByClassName("channel-icons")[0];
        this._channelsEl = document.getElementsByClassName("channels")[0];

        this.onProgramClick = () => {
        };

        this.renderList = this.renderList.bind(this);
        this.addEventListener = this.addEventListener.bind(this);

        this.addEventListener()


    }

    addEventListener() {
        let inProgram = (element) => {
            if (element.classList.contains("program-wrapper")) {
                return [element.getAttribute("data-programno"), element.getAttribute("data-dato"), element.getAttribute("data-channel")];
            }
            if (element.parentElement === null) {
                return false;
            }
            return inProgram(element.parentElement);
        };
        this._channelsEl.addEventListener("click", (e) => {
            let id = inProgram(e.target);
            if (id !== false) {
                this.onProgramClick(id)
            }
        });

    }

    renderList(channels) {
        let iconHtml = "";
        let channelHtml = "";
        let channelContent = [];

        Array.from(this._channelsEl.getElementsByClassName("programms")).forEach(element => {
            channelContent[element.getAttribute("data-channel")] = element.innerHTML;
        });

        channels.forEach(channel => {
            iconHtml += `<div class="channelicon" data-img-for="${channel}" style="height:${this._app.responsive.programHeight}px;">
                        <img src="../server/data/images/${channel}.png" width="50">
                    </div>`;

            channelHtml += `<div class="programms" data-channel="${channel}" style="height:${this._app.responsive.programHeight}px;">
                                ${ (typeof channelContent[channel] !== "undefined" ? channelContent[channel] : "") }
                            </div>`;
        });

        this._channelIconsEl.innerHTML = iconHtml;
        this._channelsEl.innerHTML = channelHtml;


    }
    addLabels(labels) {
        Object.keys(labels).forEach(channel=>{
            let iconImg = this._channelIconsEl.querySelector("[data-img-for='" + channel + "'] img");
            if (iconImg !== null) {
                iconImg.setAttribute("alt", labels[channel]);
                iconImg.setAttribute("title", labels[channel]);
            }
        })
    }

}