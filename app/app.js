require("./bundle-config");
const application = require("application");
var config = require("./shared/config");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");

if (appSettings.getBoolean("message") === undefined) {
    appSettings.setString("simulacrumArray", "[]");
    appSettings.setNumber("count", 1);
}

if (appSettings.getString("folio") === undefined) {
    application.start({ moduleName: "view/home/home-page" });
    
} else {
    application.start({ moduleName: "view/home-client/home-client" });
    
}



//application.start({ moduleName: "view/home/home-page" });
