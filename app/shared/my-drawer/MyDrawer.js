const frameModule = require("ui/frame");

const MyDrawerViewModel = require("./MyDrawer-view-model");
var appSettings = require("application-settings");
var observableModule = require("data/observable");

/* ***********************************************************
 * Use the "loaded" event handler of the wrapping layout element to bind the view model to your view.
 *************************************************************/



function onLoaded(args) {
    const component = args.object;
    const componentTitle = component.selectedPage;
    component.bindingContext = new MyDrawerViewModel(componentTitle, appSettings.getString("folio"), appSettings.getString("name"), appSettings.getString("email"));
   
}

/* ***********************************************************
 * Use the "tap" event handler of the <GridLayout> component for handling navigation item taps.
 * The "tap" event handler of the app drawer <GridLayout> item is used to navigate the app
 * based on the tapped navigationItem's route.
 *************************************************************/
function onNavigationItemTap(args) {
    const component = args.object;
    const componentRoute = component.route;
    
    frameModule.topmost().navigate({
        moduleName: componentRoute,
        transition: {
            name: "fade"
        }
    });
}

exports.onLogout = function () {

    console.log("Tu folio actual ----- " + appSettings.getString("folio"));
    console.log("Identificador ----- " + appSettings.getString("identificador"));
    appSettings.remove("folio");
    appSettings.remove("identificador");
    appSettings.remove("email");
    appSettings.remove("name");
    frameModule.topmost().navigate({
        moduleName: "view/home/home-page",
        transition: {
            name: "fade"
        }
    });
}

exports.onLoaded = onLoaded;
exports.onNavigationItemTap = onNavigationItemTap;
