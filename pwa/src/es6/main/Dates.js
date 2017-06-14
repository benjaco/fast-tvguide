/**
 * Created by Benjamin on 16-05-2017.
 */


export default class Dates {

    constructor(days) {
        this._daysEl = document.getElementsByClassName("days_inner")[0];
        this.onDayClick = () => {
        };

        this.render = this.render.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);

        this.render(days);

        this._daySpans = this._daysEl.querySelectorAll("span");


        this.addEventListeners();
    }

    render(days) {
        let html = "";
        days.forEach((day, index) => {
            if (index === 0) {
                html += `<span class="focus">I dag</span>`
            } else {
                html += `<span>${ day.readable}</span>`
            }
        });
        this._daysEl.innerHTML = html;
    }

    //noinspection JSMethodCanBeStatic
    addEventListeners() {
        Array.from(this._daySpans).forEach((daySpan, index) =>
            daySpan.addEventListener("click", () =>
                this.onDayClick(index)
            )
        );
    }

    focus(focusIndex) {
        Array.from(this._daySpans).forEach((daySpan, index) => {
            if (index === focusIndex) {
                daySpan.classList.add("focus")
            } else {
                daySpan.classList.remove("focus")
            }
        })
    }
}