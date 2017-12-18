/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

/*
NativeScript adheres to the CommonJS specification for dealing with
JavaScript modules. The CommonJS require() function is how you import
JavaScript modules defined in other files.
*/
var frameModule = require("ui/frame");
var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var UserViewModel = require("../../shared/view-models/user-view-model");
var Toast = require("nativescript-toast");

var page;
var toast;
var userView = new UserViewModel([]);

var pageData = new observableModule.fromObject({
});
//var HomeViewModel = require("./home-view-model");

//var homeViewModel = new HomeViewModel();

function onNavigatingTo(args) {
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

exports.individual = function () {

    var topmost = frameModule.topmost();

    // Opciones de la navegacion
    var navigationOptions = {
        moduleName: "view/home-simulacrum/home-simulacrum",
        backstackVisible: false,
        clearHistory: false,
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

exports.group = function () {
    dialogsModule.confirm({
        title: "Aviso",
        message: "Tienes folio?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        console.log("Dialog result: " + result);
        if (result) {
            dialogsModule.prompt({
                title: "Coloca tu folio",
                message: "",
                okButtonText: "Aceptar",
                cancelButtonText: "Cancelar",
            }).then(function (r) {
                console.log("Dialog result: " + r.result + ", text: " + r.text);
                if (r.result) {
                    if (r.text === '') {
                        toast = Toast.makeText("No ingresaste el folio.").show();
                    } else {
                        console.log("Folio ingresado ----> " + r.text);
                        userView.searchFolio(r.text);
                        if (r.text === 'JM100') {
                            console.log("BUENO BUENO----->");
                            var topmostM = frameModule.topmost();

                            // Opciones de la navegacion
                            var navigationOptionsM = {
                                moduleName: "view/home-client/home-client",
                                backstackVisible: false,
                                clearHistory: true,
                                animated: true,
                                transition: {
                                    name: "slideLeft",
                                    duration: 380,
                                    curve: "easeIn"
                                }
                            };

                            // Navegamos a la vista indicada
                            topmostM.navigate(navigationOptionsM);
                            //appSettings.setBoolean("existUser", true);
                            //appSettings.setString("folioUser", r.text);

                        } else {
                            alert("No se encuentra ningun usuario con el folio; " + r.text);
                        }

                    }

                } else {
                    console.log("No quiero buscarlo");
                }
            });
        } else {
            var topmost = frameModule.topmost();

            // Opciones de la navegacion
            var navigationOptions = {
                moduleName: "view/add-user/add-user",
                backstackVisible: false,
                clearHistory: false,
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
    });

}



exports.onNavigatingTo = onNavigatingTo;