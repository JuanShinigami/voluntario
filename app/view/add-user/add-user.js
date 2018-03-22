var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var UserViewModel = require("../../shared/view-models/user-view-model");
var Toast = require("nativescript-toast");

var page;
var topmost;
var navigationOptions;

var userView = new UserViewModel([]);

var pageData = new observableModule.fromObject({
	name: "",
    email: "",
    password: "",
    repeatPassword: ""
});

exports.loaded = function (args) {
    topmost = frameModule.topmost();
	page = args.object;
    page.bindingContext = pageData;
    pageData.name = '';
    pageData.email = '';
    pageData.phone = '';
}

exports.onSaveUser = function () {
    
    if (verifyEmpty(pageData.name) && verifyEmpty(pageData.email) && verifyEmpty(pageData.password) && verifyEmpty(pageData.repeatPassword)) {

        if (validatePassword()) {
            var userJson = { "name": pageData.name, "email": pageData.email, "phone": "000000000", "password": pageData.password };
            pageData.set("isLoading", true);
            userView.add(userJson).catch(function () {
                dialogsModule.alert({
                    message: "Ocurrio un error al registrarte, intentalo m\u00E1s tarde.",
                    okButtonText: "Aceptar"
                });
                pageData.set("isLoading", false);
            }).then(function (data) {
                console.dir(data);

                if(data.response.flag === "true") {
                    dialogsModule.alert({
                        message: "Tu registro fue exitoso, ahora eres un voluntario.",
                        okButtonText: "Aceptar"
                    }).then(function () {
                        pageData.set("isLoading", true);
                        var datos = new Array();
                        datos['correo'] = pageData.email;
                        datos['contrasena'] = pageData.password;

                        userView.login(datos).then(function (data) {
                            console.dir(data);
                            console.log(data.response.registro.status);
                            if (data.response.registro.status) {
                                console.log("Traje true");
                                appSettings.setString("emailUser", data.response.registro.datos[0].correo);
                                appSettings.setString("nameUser", data.response.registro.datos[0].nombre);
                                appSettings.setNumber("idUser", parseInt(data.response.registro.datos[0].id));
                                appSettings.setString("tokenUser", data.response.token);
                                appSettings.setBoolean("login", true);
                                pageData.set("isLoading", false);
                                navigateTopmost("view/home/home-page", false, true);
                            } else {
                                console.log("Traje flase");
                                pageData.set("isLoading", false);
                                dialogsModule.alert({
                                    message: "No pude procesar la petici\363n.",
                                    okButtonText: "Aceptar"
                                });
                            }
                        }).catch(function (error) {
                            dialogsModule.alert({
                                message: "No pude procesar la petici\363n.",
                                okButtonText: "OK"
                            });
                            pageData.set("isLoading", false);
                            return Promise.reject();
                        });

                        //navigateTopmost("view/login/login", false, true);
                    });
                } else {
                    dialogsModule.alert({
                        message: "El correo electronico que ingresaste ya existe.",
                        okButtonText: "Aceptar"
                    });
                }
                pageData.set("isLoading", false);
            });
        } else {
            dialogsModule.alert({
                title: "Aviso",
                message: "Contraseña y repetir contraseña son diferentes.",
                okButtonText: "Aceptar"
            }).then(function () {

            });
        }

        
	    
	} else {
		dialogsModule.alert({
			title: "Aviso",
			message: "Es necesario llenar todos los campos.",
			okButtonText: "Aceptar"
		}).then(function () {
			
		});
	}
}

exports.back = function () {
    navigateTopmost("view/login/login", false, true);
}

function verifyEmpty(field) {
	var flag = true;
	if (field === "") {
		flag = false;
	}
	return flag;
}

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

function validatePassword() {
    var flag = false;
    if (pageData.password == pageData.repeatPassword) {
        flag = true;
    }
    return flag;
}