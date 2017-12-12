var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var frameModule = require("ui/frame");

var page;

var pageData = new observableModule.fromObject({
    
});

function onNavigatingTo(args) {
    
    if (args.isBackNavigation) {
        return;
    }

    page = args.object;
    page.bindingContext = pageData;
}

function onDrawerButtonTap(args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
