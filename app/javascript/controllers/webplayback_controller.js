import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="webplayback"
export default class extends Controller {
    connect() {
        window.onSpotifyWebPlaybackSDKReady = this.init_player.bind(this);
        this.token_used = false;
    }

    init_player() {
        this.player = new Spotify.Player({
            name: "MWRS",
            getOAuthToken: this.get_token.bind(this),
        });

        this.player.connect();
    }

    get_token(cb) {
        if (!this.token_used) {
            cb($(this.element).data("auth-token"));
            this.token_used = true;
            return;
        }

        $.ajax({
            type: "POST",
            url: "/spotify/refresh",
            data: {
                authenticity_token: $('[name="csrf-token"]')[0].content,
            },
            success: (res) => cb(res.auth),
            error: () => (location.href = "/"),
        });
    }

    disconnect() {
        clearTimeout(this.renew_timeout);
        if (!this.player) return;
        this.player.disconnect();
    }
}
