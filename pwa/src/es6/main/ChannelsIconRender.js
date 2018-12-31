/**
 * Created by Benjamin on 10-05-2017.
 */

export default class ChannelsIconRender {

    constructor(app) {
        this._app = app;
        this._channelIconsEl = document.getElementsByClassName("channel-icons")[0];

        this.render = this.render.bind(this);
    }


    render(channels) {

        let iconHtml = "";

        channels.forEach(channel => {
            iconHtml += `
                    <div class="channelicon" data-img-for="${channel}" style="height:${this._app.responsive.programHeight}px;">
                        <img src="../images/${channel}.png" width="40" height="40" >
                    </div>`;
        });

        this._channelIconsEl.innerHTML = iconHtml;
        this._channelIconsEl.style.minHeight = 0;

    }


    addLabels(labels) {
        Object.keys(labels).forEach(channel => {
            let iconImg = this._channelIconsEl.querySelector("[data-img-for='" + channel + "'] img");
            if (iconImg !== null) {
                iconImg.setAttribute("alt", labels[channel]);
                iconImg.setAttribute("title", labels[channel]);
            }
        })
    }

}