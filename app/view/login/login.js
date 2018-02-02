var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var config = require("../../shared/config");
var UserViewModel = require("../../shared/view-models/user-view-model");
var fingerprintAuthPlugin = require("nativescript-fingerprint-auth");
var fingerprintAuth = new fingerprintAuthPlugin.FingerprintAuth();
var Toast = require("nativescript-toast");
var toast;

var userViewModel = new UserViewModel([]);
var topmost;
var navigationOptions;
var page;

var user = new observableModule.fromObject({
    email: "vane@gmail.com",
    folio: "VV100"
});


exports.loaded = function (args) {

    /*fingerprintAuth.available().then(
        function (avail) {
            if (avail.any) {
                viewToast("Cuentas con lector de huella");
                fingerprintAuth.verifyFingerprint(
                    {
                        title: 'Tousch ID para Voluntario', // optional title (used only on Android)
                        message: 'Use su huella digital para verificar su identidad.', // optional (used on both platforms) - for FaceID on iOS see the notes about NSFaceIDUsageDescription
                        authenticationValidityDuration: 10, // optional (used on Android, default 5)
                        useCustomAndroidUI: false // set to true to use a different authentication screen (see below)
                    })
                    .then(
                    function () {
                        alert("Si eres tu");
                    },
                    function (error) {
                        // when error.code === -3, the user pressed the button labeled with your fallbackMessage
                        alert(JSON.stringify(error));
                    }
                    );
            } else {
                viewToast("sNo cuentas con lector de huellas");
            }
        }
    )*/

    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = user;
    if (appSettings.getBoolean("message") === undefined) {
        dialogsModule.alert({
            title: "Informaci\u00F3n",
            message: "Voluntario es una herramienta para poder simular un simulacro. \u00A9 2017 IOFractal.",
            okButtonText: "Aceptar"
        }).then(function () {
            appSettings.setBoolean("message", true);
        });
    }

    

    //console.log("Cargue el login");
};

exports.signIn = function () {
    

    user.set("isLoading", true);
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
            user.set("isLoading", false);
            navigateTopmost("view/home/home-page", false, true);
            
            //console.log("LOA --> " + data.response.datos[0].folio);
            
        } else {
            alert("\241Comprueba tus datos de acceso!");
        }
    }).catch(function (error) {
        console.log(error);
        dialogsModule.alert({
            message: "No pude procesar la petición.",
            okButtonText: "OK"
        });
        user.set("isLoading", false);
        return Promise.reject();
    });
    
    //alert("Signing in");
};

exports.register = function () {
    navigateTopmost("view/add-user/add-user", false, false);
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

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}