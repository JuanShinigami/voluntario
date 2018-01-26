require("./bundle-config");
const application = require("application");
var config = require("./shared/config");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var localNotifications = require("nativescript-local-notifications");
var nameModuleStr = "";



if (appSettings.getBoolean("login") === undefined) {
    //application.start({ moduleName: "view/home/home-page" });
    nameModuleStr = "view/login/login";
    //application.start({ moduleName: "view/login/login" });
} else {
    //application.start({ moduleName: "view/home/home-page" });
    nameModuleStr = "view/home/home-page";
}

application.start({ moduleName: nameModuleStr });

if (appSettings.getBoolean("message") === undefined) {
    appSettings.setString("simulacrumArray", "[]");
    appSettings.setNumber("count", 1);
}