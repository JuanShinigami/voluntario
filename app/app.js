require("./bundle-config");
const application = require("application");
var config = require("./shared/config");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");

if (appSettings.getBoolean("message") === undefined) {
    appSettings.setString("simulacrumArray", "[]");
    appSettings.setNumber("count", 1);
}




application.start({ moduleName: "view/home/home-page" });
