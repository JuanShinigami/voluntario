var frameModule = require("ui/frame");
var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var UserViewModel = require("../../shared/view-models/user-view-model");
var Toast = require("nativescript-toast");

var topmost;
var navigationOptions;
var page;
var toast;
var userView = new UserViewModel([]);


var pageData = new observableModule.fromObject({
});


exports.onNavigatingTo = function(args) {
    topmost = frameModule.topmost();
    if (appSettings.getBoolean("message") === undefined) {
        dialogsModule.alert({
            title: "Información",
            message: "Voluntario es una herramienta para poder simular un simulacro. © 2017 IOFractal.",
            okButtonText: "Aceptar"
        }).then(function () {
            appSettings.setBoolean("message", true);
        });
    }
    page = args.object;
    
    page.bindingContext = pageData;
}

exports.individual = function () {
    // false, false
    navigateTopmost("view/home-simulacrum/home-simulacrum", true, false);
}

exports.group = function () {
    
    dialogsModule.action({
        message: "\u00BFQué acción desea realizar?",
        cancelButtonText: "Cancelar",
        actions: ["Crear", "Unirse"]
    }).then(function (result) {
        switch (result) {
            case "Crear":
                config.flag = true;
                config.titleBarListSimulacrumGroup = "Simulacros creados";
                navigateTopmost("view/list-simulacrum-group/list-simulacrum-group", true, false);
                break;
            case "Unirse":
                config.flag = false;
                config.titleBarListSimulacrumGroup = "Participación";
                navigateTopmost("view/list-simulacrum-group/list-simulacrum-group", true, false);
                break;
            default:
                break;
        }
    });
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