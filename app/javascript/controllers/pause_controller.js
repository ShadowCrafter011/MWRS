import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="pause"
export default class extends Controller {
    connect() {
        this.paused = false;
        this.audio = $(
            '*[data-controller="simple-sound"], *[data-controller="sound"]',
        );
    }

    toggle() {
        this.paused = !this.paused;
        if (this.paused) {
            this.audio.data("muted", true);
            $(this.element).text("Re-enable sounds");
            $("audio").trigger("pause");
            $("audio").prop("currentTime", 0);
        } else {
            this.audio.removeData("muted");
            $(this.element).text("Disable all sounds");
        }
    }
}
