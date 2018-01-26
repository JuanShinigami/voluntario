var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var config = require("../../shared/config");
var UserViewModel = require("../../shared/view-models/user-view-model");

var userViewModel = new UserViewModel([]);
var topmost;
var navigationOptions;
var page;

var user = new observableModule.fromObject({
    email: "vane@gmail.com",
    folio: "VV100"
});


exports.loaded = function (args) {
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = user;
    //console.log("Cargue el login");
};

exports.signIn = function () {
    var datos = new Array();
    datos['correo'] = user.email;
    datos['folio'] = user.folio;
    userViewModel.login(datos).then(function (data) {
        //console.dir(data);
        if (data.response.status) {
            appSettings.setString("folioUser", data.response.datos[0].folio);
            appSettings.setString("emailUser", data.response.datos[0].correo);
            appSettings.setString("phoneUser", data.response.datos[0].telefono);
            appSettings.setString("nameUser", data.response.datos[0].nombre);
            appSettings.setNumber("idUser", parseInt(data.response.datos[0].id));
            appSettings.setBoolean("login", true);
            navigateTopmost("view/home/home-page", false, false);
            
            //console.log("LOA --> " + data.response.datos[0].folio);
            
        } else {
            alert("\241Comprueba tus datos de acceso!");
        }
    });
    
    //alert("Signing in");
};

exports.register = function () {
    alert("Registering");
};

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