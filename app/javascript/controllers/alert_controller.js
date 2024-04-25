import { Controller } from "@hotwired/stimulus";
import $ from "jquery";

// Connects to data-controller="alert"
export default class extends Controller {
    connect() {
        alert($(this.element).text());
    }
}
