var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var geolocation = require("nativescript-geolocation");
var Toast = require("nativescript-toast");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");

var meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
var diasSemana = new Array("Domingo", "Lunes", "Martes", "Mi�rcoles", "Jueves", "Viernes", "S�bado");
var date = new Date();
var sismoGroupList = new SismoGroupViewModel([]);

var page;
var topmost;
var navigationOptions;
var timepickker;

var pageData = new observableModule.fromObject({
    sismoGroupList: sismoGroupList,
    currentDate: diasSemana[date.getDay()] + ", " + date.getDate() + " de " + meses[date.getMonth()] + " de " + date.getFullYear()
});

exports.loaded = function (args) {
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = pageData;
    loadDefaultValues();
}

function loadDefaultValues() {
    timepickker = page.getViewById('timePicker');
    timepickker.hour = date.getHours();
    timepickker.minute = date.getMinutes();
}

exports.back = function () {
    navigateTopmost("view/list-simulacrum-group/list-simulacrum-group", true, false);
}

exports.onSaveSimulacrumGroup = function () {
    pageData.set("isLoading", true);
    //console.log("Entre aqui para guardar");
    geolocation.isEnabled().then(function (isEnabled) {
        if (!isEnabled) {
            geolocation.enableLocationRequest().then(function () {
            }, function (e) {
                console.log("Error: " + (e.message || e));
                viewToast("No puedo acceder a tu ubicaci�n.");
            });
        } else {
            //console.log("aqui 1");
            var location = geolocation.getCurrentLocation({ desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000 }).
                then(function (loc) {
                    if (loc) {
                        //console.log("aqui 2");
                        //console.dir(loc);
                        fetch(config.apiMapsDirection + loc.latitude + "," + loc.longitude + config.apiKeyGoogle, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }).then(handleErrors)
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (data) {
                            var timeWait = Math.floor(Math.random() * 10) + 1;
                            //console.log("TIMEPO DE ESPERA -----> " + timeWait);
                            var completeDirection = JSON.stringify(data.results[0].formatted_address);
                            var datos = new Array();
                            datos["ubicacion"] = completeDirection.slice(1, -1);
                            datos["latitud"] = loc.latitude;
                            datos["longitud"] = loc.longitude;
                            datos["fecha"] = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
                            datos["hora"] = timepickker.hour + ":" + timepickker.minute;
                            datos["idVoluntarioCreador"] = appSettings.getNumber("idUser");
                            datos["tiempoPreparacion"] = timeWait;
                            datos["tipoSimulacro"] = "creado";
                            
                            sismoGroupList.addSimulacrumGroup(datos).then(function (data) {
                                pageData.set("isLoading", false);
                                dialogsModule.alert({
                                    title: "Informaci\u00F3n",
                                    message: "Tu simulacro se ha creado satisfactoriamente.",
                                    okButtonText: "Aceptar"
                                }).then(function () {

                                    
                                });
                            }).catch(function (error) {
                                pageData.set("isLoading", false);
                                console.log(error);
                                dialogsModule.alert({
                                    message: "No es posible guardar un simulacro, intentalo m�s tarde.",
                                    okButtonText: "Aceptar"
                                });
                                return Promise.reject();
                            });
                        });
                    }
                }, function (e) {
                    viewToast("No es posible encontrar tu ubucaci�n.");
                    pageData.set("isLoading", false);
                    console.log("Error: " + e.message);
                });
        }
    }, function (e) {
        viewToast("Vuelve a intenerlo.");
        pageData.set("isLoading", false);
        console.log("Error: " + (e.message || e));
    });
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

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

function handleErrors(response) {
    if (!response.ok) {
        viewToast(response.statusText);
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}