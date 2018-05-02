const application = require("application");
var frameModule = require("ui/frame");
var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var SimulacrumVoluntaryViewModel = require("../../shared/view-models/simulacrum-voluntary-view-model");
var UserViewModel = require("../../shared/view-models/user-view-model");
var Toast = require("nativescript-toast");
var geolocation = require("nativescript-geolocation");
var localNotifications = require("nativescript-local-notifications");
var openApp = require("nativescript-open-app").openApp;
var Vibrate = require("nativescript-vibrate").Vibrate;
var sound = require("nativescript-sound");
var Volume = require("nativescript-volume").Volume;
var SocialShare = require("nativescript-social-share");
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;

var topmost;
var navigationOptions;
var page;
var toast;
var sismoGroupList = new SismoGroupViewModel([]);
var simulacrumVoluntrayList = new SimulacrumVoluntaryViewModel([]);
var userViewModel = new UserViewModel([]);
var idVoluntarySimulacrum = 0;
var vibrator = new Vibrate();
var volume = new Volume();
var loader = new LoadingIndicator();
var optionsDialogModal = null;

var pageData = new observableModule.fromObject({
});


exports.loaded = function (args) {
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = pageData;
}

exports.admin = function () {
    navigateTopmost("view/group-admin-simulacrum/group-admin-simulacrum", false, false);
}

exports.voluntary = function () {
    navigateTopmost("view/group-join-simulacrum/group-join-simulacrum", false, false);
}

exports.logout = function () {
    console.log("CERAR SESION");
}

exports.back = function () {
    navigateTopmost("view/principal-primary/principal-primary", false, false);
}

function navigateTopmost(nameModule, backstack, clearHistory) {
    navigationOptions = {
        moduleName: nameModule,
        backstackVisible: backstack,
        clearHistory: clearHistory,
        animated: true,
        transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }
    };
    topmost.navigate(navigationOptions);
}