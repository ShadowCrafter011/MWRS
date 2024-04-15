import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="pause"
export default class extends Controller {
    connect() {
        this.paused = false;
        this.audio = $(
            '*[data-controller="simple-sound"], *[data-controller="sound"]',
        );
        console.log(this.simple_audio);
    }

    toggle() {
        this.paused = !this.paused;
        if (this.paused) {
            this.audio.data("muted", true);
            console.log(this.audio);
            $(this.element).text("Re-enable sounds");
        } else {
            this.audio.removeData("muted");
            $(this.element).text("Disable all sounds");
        }
    }
}
