var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var Toast = require("nativescript-toast");
var geolocation = require("nativescript-geolocation");
var localNotifications = require("nativescript-local-notifications");
var frameModule = require("ui/frame");

var page;

var pageData = new observableModule.fromObject({
});

exports.onNavigatingTo = function(args) {

    page = args.object;
    page.bindingContext = pageData;
}

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}
