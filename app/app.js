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
var existLogin = appSettings.hasKey("login");
console.log("EXIST LOGIN -------------------> ------------> " + existLogin);
if(application.ios){
    if (existLogin) {
        console.log("Existo");
        application.start({ moduleName: "view/home/home-page" });
        //nameModuleStr = "view/home/home-page";
    } else {
        console.log("No existo");
        application.start({ moduleName: "view/login/login" });
        //nameModuleStr = "view/login/login";
    }
}else{
    if (config.login == "undefined") {
        if (existLogin) {
            console.log("Existo");
            application.start({ moduleName: "view/home/home-page" });
            //nameModuleStr = "view/home/home-page";
        } else {
            console.log("No existo");
            application.start({ moduleName: "view/login/login" });
            //nameModuleStr = "view/login/login";
        }
    } else {
        application.start({ moduleName: "view/home/home-page" });
    }
}



//application.start({ moduleName: nameModuleStr });