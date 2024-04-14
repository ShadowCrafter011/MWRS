import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="sound"
export default class extends Controller {
    static targets = [
        "audio",
        "background",
        "play",
        "pause",
        "probability",
        "probabilityDisplay",
        "name",
    ];

    connect() {
        this.interval = 1000;
        this.enabled = false;
        this.played = 0;
        this.time = 0;
        setInterval(this.interval_fn.bind(this), this.interval);

        let background_url = $(this.backgroundTarget).attr("src");
        this.element.style.backgroundImage = `url("${background_url}")`;
        this.update_probability_display();
        $(this.probabilityTarget).on(
            "input",
            this.update_probability_display.bind(this),
        );
    }

    play() {
        $(this.playTarget).addClass("hidden");
        $(this.pauseTarget).removeClass("hidden");
        this.enabled = true;
    }

    pause() {
        $(this.playTarget).removeClass("hidden");
        $(this.pauseTarget).addClass("hidden");
        this.enabled = false;
        this.audioTarget.pause();
        this.audioTarget.currentTime = 0;
    }

    interval_fn() {
        let probability = $(this.probabilityTarget).val();
        if (!this.enabled) return;
        if (!this.audioTarget.paused) return;
        if (Math.random() > this.probability_calc(probability) / 100)
            return this.time++;
        this.audioTarget.play();
        this.played++;
        let average = this.time / this.played;
        let unit = average > 60 ? "min" : "s";
        if (average > 60) average /= 60;
        average = Math.round(average);
        console.log(
            `Average interval for ${this.nameTarget.innerText}: ${average}${unit}`,
        );
    }

    probability_calc(x) {
        return 4 / (1 + Math.exp(-(x / 10.3) + 4.7));
    }

    update_probability_display() {
        let disp = $(this.probabilityDisplayTarget);
        let x = $(this.probabilityTarget).val();
        let probability = this.probability_calc(x);
        let unit = "s";
        let interval = ((100 / probability) * this.interval) / 1000;
        if (interval > 60) {
            interval /= 60;
            unit = "min";
        }
        interval = Math.round(interval);
        disp.text(`~${interval}${unit}`);
    }
}
