var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var frameModule = require("ui/frame");
var SismoGroupViewModel = require("../../shared/view-models/sismo-group-view-model");

var page;
var sismoGroupList = new SismoGroupViewModel([]);
var pageData = new observableModule.fromObject({
    sismoGroupList: sismoGroupList
});

exports.loaded = function(args) {
    
    page = args.object;

    page.bindingContext = pageData;

    
    var listView = page.getViewById("sismoGroupList");
    //pageData.set("isLoading", true);
    //sismoGroupList.empty();

    sismoGroupList.load(17);
    //pageData.set("isLoading", true);
}

exports.onDrawerButtonTap = function(args){
	const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}