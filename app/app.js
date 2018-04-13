//require("./bundle-config");
const application = require("application");
var config = require("./shared/config");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var localNotifications = require("nativescript-local-notifications");
var geolocation = require("nativescript-geolocation");
var Toast = require("nativescript-toast");
var nameModuleStr = "";
var toast;

if (appSettings.hasKey("login")) {
    console.log("Existo");
    nameModuleStr = "view/home/home-page";
} else {
    console.log("No existo");
    nameModuleStr = "view/login/login";
}

application.start({ moduleName: nameModuleStr });



function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}