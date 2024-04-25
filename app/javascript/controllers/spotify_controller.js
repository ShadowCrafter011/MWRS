import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="spotify"
export default class extends Controller {
    static targets = [
        "icon",
        "name",
        "author",
        "play",
        "pause",
        "progress",
        "total",
        "progressBar",
    ];

    connect() {
        window.onSpotifyWebPlaybackSDKReady = this.init_player.bind(this);
        this.token = $(this.element).data("auth-token");
        this.token_used = false;
    }

    init_player() {
        this.player = new Spotify.Player({
            name: "MWRS",
            getOAuthToken: this.get_token.bind(this),
        });

        this.player.connect();

        this.player.addListener(
            "player_state_changed",
            this.state_change.bind(this),
        );
    }

    state_change(player) {
        if (!player) return;
        console.log(player);

        if (player.track_window?.current_track) {
            let track = player.track_window.current_track;

            if (player.paused) {
                $(this.pauseTarget).addClass("hidden");
                $(this.playTarget).removeClass("hidden");
            } else {
                $(this.pauseTarget).removeClass("hidden");
                $(this.playTarget).addClass("hidden");
            }

            let largest = null;
            let width = 0;
            for (let img of track.album.images) {
                if (img.width > width && img.width == img.height) {
                    largest = img.url;
                    width = img.width;
                }
            }
            if (largest) {
                $(this.iconTarget).attr("src", largest);
            }

            $(this.nameTarget).text(track.name);

            let artists = [];
            for (let artist of track.artists) {
                artists.push(artist.name);
            }
            $(this.authorTarget).text(artists.join(","));

            let totalSeconds = Math.round(player.duration / 1000);
            let progressSeconds = Math.round(player.position / 1000);
            $(this.totalTarget).text(this.secondsToString(totalSeconds));
            $(this.progressTarget).text(this.secondsToString(progressSeconds));

            $(this.progressBarTarget).css(
                "width",
                `${(progressSeconds / totalSeconds) * 100}%`,
            );

            this.play_start = new Date().getTime();
            this.progress = player.position;
            this.total = player.duration;
            if (player.paused) {
                clearInterval(this.update_interval);
                this.update_interval = null;
            } else if (!this.update_interval) {
                this.update_interval = setInterval(
                    this.update.bind(this),
                    1000,
                );
            }
        }
    }

    update() {
        let delta_t = new Date().getTime() - this.play_start;
        let total = this.progress + delta_t;
        $(this.progressTarget).text(
            this.secondsToString(Math.round(total / 1000)),
        );
        $(this.progressBarTarget).css(
            "width",
            `${(total / this.total) * 100}%`,
        );
    }

    secondsToString(seconds) {
        let numhours = Math.floor(seconds / 3600);
        let numminutes = Math.floor((seconds % 3600) / 60);
        let numseconds = (seconds % 3600) % 60;
        if (numhours < 10) numhours = `0${numhours}`;
        if (numminutes < 10) numminutes = `0${numminutes}`;
        if (numseconds < 10) numseconds = `0${numseconds}`;
        if (numhours == "00") return `${numminutes}:${numseconds}`;
        return `${numhours}:${numminutes}:${numseconds}`;
    }

    get_token(cb) {
        if (!this.token_used) {
            cb(this.token);
            this.token_used = true;
            return;
        }

        $.ajax({
            type: "POST",
            url: "/spotify/refresh",
            data: {
                authenticity_token: $('[name="csrf-token"]')[0].content,
            },
            success: (res) => {
                cb(res.auth);
                this.token = res.auth;
            },
            error: () => (location.href = "/"),
        });
    }

    pause() {
        this.player.pause();
    }

    play() {
        this.player.resume();
    }

    disconnect() {
        clearTimeout(this.renew_timeout);
        if (!this.player) return;
        this.player.disconnect();
    }
}
