var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var config = require("../../shared/config");
var UserViewModel = require("../../shared/view-models/user-view-model");
var Toast = require("nativescript-toast");
var toast;

var userViewModel = new UserViewModel([]);
var topmost;
var navigationOptions;
var page;

var user = new observableModule.fromObject({
    email: "",
    password: ""
});


exports.loaded = function (args) {
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = user;

    var emails = page.getViewById('email');
    if (emails.android) {
        //console.log("SOY ANDROID");
        emails.dismissSoftInput();
        emails.android.clearFocus();
    }

    if (appSettings.getBoolean("message") === undefined) {
        dialogsModule.alert({
            title: "Informaci\u00F3n",
            message: "Voluntario es una herramienta para poder simular un simulacro. \u00A9 2018 IOFractal.",
            okButtonText: "Aceptar"
        }).then(function () {
            appSettings.setBoolean("message", true);
        });
        
    }
    
};

exports.signIn = function () {
    console.log("VAMOS AL LOGIN");

    user.set("isLoading", true);
    var datos = new Array();
    datos['correo'] = user.email;
    datos['contrasena'] = user.password;
    if (user.email == "" || user.password == "") {
        //alert("El correo electr\363nico y el folio son requeridos.");
        dialogsModule.alert({
            message: "El correo electr\363nico y la constraseña son requeridos.",
            okButtonText: "Aceptar"
        });
        user.set("isLoading", false);
    } else {
        userViewModel.login(datos).then(function (data) {
            console.dir(data);
            if (data.response.registro.status) {
                //appSettings.setString("folioUser", data.response.registro.datos[0].folio);
                appSettings.setString("emailUser", data.response.registro.datos[0].correo);
                //appSettings.setString("phoneUser", data.response.registro.datos[0].telefono);
                appSettings.setString("nameUser", data.response.registro.datos[0].nombre);
                appSettings.setNumber("idUser", parseInt(data.response.registro.datos[0].id));
                appSettings.setString("tokenUser", data.response.token);
                appSettings.setBoolean("login", true);
                user.set("isLoading", false);
                navigateTopmost("view/home/home-page", false, true);
            } else {
                user.set("isLoading", false);
                dialogsModule.alert({
                    message: "\241Comprueba tus datos de acceso!.",
                    okButtonText: "Aceptar"
                });
            }
        }).catch(function (error) {
            dialogsModule.alert({
                message: "No pude procesar la petici\363n.",
                okButtonText: "OK"
            });
            user.set("isLoading", false);
            return Promise.reject();
        });
    }
    //navigateTopmost("view/home/home-page", false, true);
        
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

    topmost.navigate(navigationOptions);

}

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

exports.add = function () {
    //console.log(config.apiUrl);
    dialogsModule.prompt({
        title: "Aviso",
        message: "Agrega la ruta del server",
        okButtonText: "Agregar",
        cancelButtonText: "Cancelar",
        defaultText: appSettings.getString("url")
    }).then(function (r) {
        console.log(r.result);
        if (r.result) {
            //config.apiUrl = r.text;
            appSettings.setString("url", r.text);
            viewToast("Se agreg\363 correctamente.");
        }
        //console.log("Dialog result: " + r.result + ", text: " + r.text);
    });
}