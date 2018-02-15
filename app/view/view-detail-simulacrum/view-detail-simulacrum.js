var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var config = require("../../shared/config");
var UserViewModel = require("../../shared/view-models/user-view-model");
var Toast = require("nativescript-toast");
var toast;

var topmost;
var navigationOptions;
var page;

var pageData = new observableModule.fromObject({
    name: "",
    date: "",
    hour: "",
    output: "",
    ubicacion: "",
});


exports.loaded = function (args) {
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = pageData;
    var requestData = page.navigationContext;
    console.dir(requestData);
    loadValues(requestData.item);
};



function loadValues(data) {
    pageData.name = appSettings.getString("nameUser");
    pageData.date = data.fecha;
    pageData.hour = data.hora;
    pageData.output = data.tiempo_inicio;
    pageData.ubicacion = data.ubicacion;
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

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

exports.back = function () {
    navigateTopmost("view/home/home-page", false, false);
}