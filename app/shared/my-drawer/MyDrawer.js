const frameModule = require("ui/frame");

const MyDrawerViewModel = require("./MyDrawer-view-model");
var appSettings = require("application-settings");
var observableModule = require("data/observable");
var UserViewModel = require("../view-models/user-view-model");

/* ***********************************************************
 * Use the "loaded" event handler of the wrapping layout element to bind the view model to your view.
 *************************************************************/

var userViewModel = new UserViewModel([]);

function onLoaded(args) {
    const component = args.object;
    const componentTitle = component.selectedPage;
    component.bindingContext = new MyDrawerViewModel(componentTitle, appSettings.getString("nameUser"), appSettings.getString("emailUser"));
   
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

    console.log("TAP logout");
    userViewModel.logout().then(function (dataResponse) {
        console.dir(dataResponse);
        if (dataResponse.response.update.status) {
            appSettings.remove("login");
            //appSettings.remove("folioUser");
            appSettings.remove("emailUser");
            //appSettings.remove("phoneUser");
            appSettings.remove("nameUser");
            appSettings.remove("idUser");
            appSettings.remove("tokenUser");
            frameModule.topmost().navigate({
                moduleName: "view/login/login",
                transition: {
                    name: "fade"
                }
            });
        }
    });
}

exports.onLoaded = onLoaded;
exports.onNavigationItemTap = onNavigationItemTap;
