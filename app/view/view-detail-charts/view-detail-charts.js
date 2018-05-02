var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var config = require("../../shared/config");
var Toast = require("nativescript-toast");
var webViewModule = require("ui/web-view");
//var md5 = require('MD5');
var toast;


var page;

var pageData = new observableModule.fromObject({
    url: "http://google.com"
});

exports.pageLoaded = function (args) {
    console.log("Details Charts");
    page = args.object;
    page.bindingContext = pageData;
    var requestData = page.navigationContext;
    //pageData.url = "http://gmail.com/" + requestData.idSG;
    //console.log("MD5 -------------> " + md5(requestData.idSG));
}
