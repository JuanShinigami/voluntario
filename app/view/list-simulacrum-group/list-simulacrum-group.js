var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var page;
var topmost;
var navigationOptions;

var pageData = new observableModule.fromObject({
    simulacrumList: new ObservableArray([
        { date: new Date(), countVoluntary: 2, duration: "3:45" },
        { date: new Date(), countVoluntary: 5, duration: "3:25" },
        { date: new Date(), countVoluntary: 8, duration: "3:05" }
    ])
});

exports.loaded = function (args) {
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = pageData;
    
}

exports.back = function () {
    navigateTopmost("view/home/home-page", true, false); 
}

exports.onCreateSimulacrumGroup = function () {
    navigateTopmost("view/add-simulacrum-group/add-simulacrum-group", true, false);
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

    // Navegamos a la vista indicada
    topmost.navigate(navigationOptions);

}