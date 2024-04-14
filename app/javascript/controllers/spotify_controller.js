import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="spotify"
export default class extends Controller {
    static targets = ["embed"];

    connect() {
        window.onSpotifyIframeApiReady = this.api_ready.bind(this);
    }

    api_ready(api) {
        this.api = api;

        let uri = `spotify:${$(this.element).data("spotify-id")}`;
        this.api.createController(
            this.embedTarget,
            {
                uri: uri,
            },
            () => {},
        );
    }
}
