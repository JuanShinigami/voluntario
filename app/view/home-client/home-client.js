var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var frameModule = require("ui/frame");

var page;

var pageData = new observableModule.fromObject({
    cars: new ObservableArray([
        { name: "eggs", price: 90.1, imageUrl: "https://www.cstatic-images.com/car-pictures/xl/usc70chc021e021001.png", class: "rgrg", transmission: "Manual", hasAC: true },
        { name: "bread", price: 80.1, imageUrl: "https://www.cstatic-images.com/car-pictures/xl/usc70chc021e021001.png", class: "rtgrtg", transmission: "Manual", hasAC: true },
        { name: "cereal", price: 70.1, imageUrl: "https://www.cstatic-images.com/car-pictures/xl/usc70chc021e021001.png", class: "bfgbrer", transmission: "Manual", hasAC: true }
    ])
});

exports.loaded = function(args) {
    /*
    This gets a reference this page’s <Page> UI component. You can
    view the API reference of the Page to see what’s available at
    https://docs.nativescript.org/api-reference/classes/_ui_page_.page.html
    */
    var page = args.object;

    /*
    A page’s bindingContext is an object that should be used to perform
    data binding between XML markup and JavaScript code. Properties
    on the bindingContext can be accessed using the {{ }} syntax in XML.
    In this example, the {{ message }} and {{ onTap }} bindings are resolved
    against the object returned by createViewModel().

    You can learn more about data binding in NativeScript at
    https://docs.nativescript.org/core-concepts/data-binding.
    */
    page.bindingContext = pageData;
}

exports.onDrawerButtonTap = function(args){
	const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}