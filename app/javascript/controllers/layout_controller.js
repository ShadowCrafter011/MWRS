import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="layout"
export default class extends Controller {
    static targets = ["simple", "advanced", "button"];

    connect() {
        this.simple = false;
    }

    switch() {
        $(this.simpleTarget).toggleClass("hidden");
        $(this.advancedTarget).toggleClass("hidden");
        this.simple = !this.simple;

        $("audio").trigger("pause");
        $("audio").prop("currentTime", 0);

        if (this.simple) {
            $(this.buttonTarget).text("Switch to advanced layout");
            $('*[data-advanced="1"]').data("disabled", true);
            $('*[data-simple="1"]').removeData("disabled");
        } else {
            $(this.buttonTarget).text("Switch to simple layout");
            $('*[data-simple="1"]').data("disabled", true);
            $('*[data-advanced="1"]').removeData("disabled");
        }
    }
}
