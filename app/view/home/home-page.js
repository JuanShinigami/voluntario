var frameModule = require("ui/frame");
var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var UserViewModel = require("../../shared/view-models/user-view-model");
var Toast = require("nativescript-toast");
var localNotifications = require("nativescript-local-notifications");

var topmost;
var navigationOptions;
var page;
var toast;
var userView = new UserViewModel([]);


var pageData = new observableModule.fromObject({
});


exports.loaded = function(args) {
    topmost = frameModule.topmost();

    // OPCIONES DE NAVEGACION
    /*var navigationEntryArt = {
        moduleName: "view/simulacrum-join/simulacrum-join",
        backstackVisible: false,
        animated: true,
        context: {
            date: new Date(new Date().getTime() - (5 * 1000))
        },
        transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }
    };
    // Dirigimos a la vista de articulos
    frameModule.topmost().navigate(navigationEntryArt);*/
    //navigateTopmost("view/simulacrum-join/simulacrum-join", true, false);
    localNotifications.addOnMessageReceivedCallback(
        function (notification) {
            var navigationEntryArt = {
                moduleName: "view/simulacrum-join/simulacrum-join",
                backstackVisible: false,
                animated: true,
                context: {
                    date: notification.id
                },
                transition: {
                    name: "slideLeft",
                    duration: 380,
                    curve: "easeIn"
                }
            };
            frameModule.topmost().navigate(navigationEntryArt);
            console.log("ID: " + notification.id);
            console.log("Title: " + notification.title);
            console.log("Body: " + notification.body);
            console.log("Time : " + notification.groupedMessages);
            
        }
    ).then(function () {
        console.log("Listener added");
    });
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

exports.logout = function () {
    appSettings.remove("login");
    appSettings.remove("folioUser");
    appSettings.remove("emailUser");
    appSettings.remove("phoneUser");
    appSettings.remove("nameUser");
    appSettings.remove("idUser");
    navigateTopmost("view/login/login", false, true);
}