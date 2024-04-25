import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="webplayback"
export default class extends Controller {
    connect() {
        window.onSpotifyWebPlaybackSDKReady = this.init_player.bind(this);
        this.el = $(this.element);
    }

    get_token() {
        return this.el.data("auth-token");
    }

    init_callback(cb) {
        this.callback = cb;
        cb(this.get_token());
        this.renew_timeout = setTimeout(
            this.regenerate_token.bind(this),
            this.el.data("auth-expire") * 1000,
        );
    }

    regenerate_token() {
        console.log("Regenerate token");
        $.ajax({
            type: "POST",
            url: "/spotify/refresh",
            data: {
                authenticity_token: $('[name="csrf-token"]')[0].content,
            },
            success: this.replace_token.bind(this),
            error: () => (location.href = "/"),
        });
    }

    replace_token(res) {
        if (!res?.auth) return (location.href = "/");
        this.renew_timeout = setTimeout(
            this.regenerate_token.bind(this),
            res.auth_expire * 1000,
        );
        this.callback(res.auth);
    }

    init_player() {
        this.player = new Spotify.Player({
            name: "MWRS",
            getOAuthToken: this.init_callback.bind(this),
        });

        // Ready
        this.player.addListener("ready", ({ device_id }) => {
            console.log("Ready with Device ID", device_id);
        });

        // Not Ready
        this.player.addListener("not_ready", ({ device_id }) => {
            console.log("Device ID has gone offline", device_id);
        });

        this.player.addListener("initialization_error", ({ message }) => {
            console.error(message);
        });

        this.player.addListener("authentication_error", ({ message }) => {
            console.error(message);
        });

        this.player.addListener("account_error", ({ message }) => {
            console.error(message);
        });

        this.player.connect();
    }

    disconnect() {
        clearTimeout(this.renew_timeout);
        if (!this.player) return;
        this.player.disconnect();
    }
}
