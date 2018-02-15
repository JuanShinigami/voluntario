var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var geolocation = require("nativescript-geolocation");
var Toast = require("nativescript-toast");
var ModalPicker = require("nativescript-modal-datetimepicker").ModalDatetimepicker;
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var localNotifications = require("nativescript-local-notifications");

var meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
var diasSemana = new Array("Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado");
var date = new Date();
var sismoGroupList = new SismoGroupViewModel([]);
var picker = new ModalPicker();

var page;
var topmost;
var navigationOptions;
var timepickker;
var flagDate;
var flagTime;

var pageData = new observableModule.fromObject({
    sismoGroupList: sismoGroupList,
    currentDate: diasSemana[date.getDay()] + ", " + date.getDate() + " de " + meses[date.getMonth()] + " de " + date.getFullYear(),
    selectDate: "No seleccionado",
    selectTime: "No seleccionado",
    dateFormating: "",
    hourView: "",
    minutesView: ""
});

exports.loaded = function (args) {
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = pageData;
    loadDefaultValues();
}

function loadDefaultValues() {
    pageData.selectDate = "No seleccionado";
    pageData.selectTime = "No seleccionado";
    flagDate = false;
    flagTime = false;
}

exports.back = function () {
    navigateTopmost("view/home/home-page", false, false);
}

exports.onSaveSimulacrumGroup = function () {
    if (flagTime && flagDate) {

        var dateInput = toDate(pageData.selectTime, "h:m");
        var resInput = pageData.selectDate.split("-");
        dateInput.setFullYear(parseInt(resInput[2]));
        dateInput.setMonth(parseInt(resInput[1] - 1));
        dateInput.setDate(parseInt(resInput[0]));

        var dateCurrentValidate = new Date();
        if (dateInput.getTime() >= dateCurrentValidate.getTime()) {

            pageData.set("isLoading", true);
            geolocation.isEnabled().then(function (isEnabled) {
                if (!isEnabled) {
                    geolocation.enableLocationRequest().then(function () {
                    }, function (e) {
                        console.log("Error: " + (e.message || e));
                        viewToast("No puedo acceder a tu ubicación.");
                    });
                } else {



                    var location = geolocation.getCurrentLocation({ desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000 }).
                        then(function (loc) {
                            if (loc) {
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
                                        var completeDirection = JSON.stringify(data.results[0].formatted_address);
                                        var datos = new Array();
                                        datos["ubicacion"] = completeDirection.slice(1, -1);
                                        datos["latitud"] = loc.latitude;
                                        datos["longitud"] = loc.longitude;
                                        datos["fecha"] = pageData.selectDate;
                                        datos["hora"] = pageData.selectTime;
                                        datos["idVoluntarioCreador"] = appSettings.getNumber("idUser");
                                        datos["tiempoPreparacion"] = timeWait;
                                        datos["tipoSimulacro"] = "creado";

                                        sismoGroupList.addSimulacrumGroup(datos).then(function (data) {
                                            //console.dir(data);
                                            if (data.response.voluntarioSimulacro.status) {
                                                var dateSimulacrum = toDate(datos["hora"], "h:m");
                                                var res = datos["fecha"].split("-");
                                                dateSimulacrum.setFullYear(parseInt(res[2]));
                                                dateSimulacrum.setMonth(parseInt(res[1] - 1));
                                                dateSimulacrum.setDate(parseInt(res[0]));
                                                var myObj = JSON.stringify({
                                                    dateTime: dateSimulacrum.getTime(),
                                                    idVoluntarySimulacrum: parseInt(data.response.voluntarioSimulacro.idVoluntarioSimulacro),
                                                    //idVoluntary: appSettings.getNumber("idUser"),
                                                    idSimulacrum: data.response.idSimulacrum,
                                                    typeVoluntary: 'create'
                                                });

                                                dialogsModule.alert({
                                                    title: "Informaci\u00F3n",
                                                    message: "Tu simulacro se ha creado satisfactoriamente.",
                                                    okButtonText: "Aceptar"
                                                }).then(function () {
                                                    definirSimulacroVoluntario(JSON.parse(myObj));
                                                    var navigationEntryArt = {
                                                        moduleName: "view/simulacrum-join/simulacrum-join",
                                                        backstackVisible: false,
                                                        animated: true,
                                                        context: {
                                                            data: JSON.parse(myObj)
                                                        },
                                                        transition: {
                                                            name: "slideLeft",
                                                            duration: 380,
                                                            curve: "easeIn"
                                                        }
                                                    };
                                                    frameModule.topmost().navigate(navigationEntryArt);
                                                });

                                            } else {
                                                alert("¡No se creo tu simulacro!. Inténtalo más tarde.");
                                            }
                                            

                                            /*pageData.set("isLoading", false);
                                            dialogsModule.alert({
                                                title: "Informaci\u00F3n",
                                                message: "Tu simulacro se ha creado satisfactoriamente.",
                                                okButtonText: "Aceptar"
                                            }).then(function () {
                                                var dateSimulacrum = toDate(datos["hora"], "h:m");
                                                var res = datos["fecha"].split("-");
                                                dateSimulacrum.setFullYear(parseInt(res[2]));
                                                dateSimulacrum.setMonth(parseInt(res[1] - 1));
                                                dateSimulacrum.setDate(parseInt(res[0]));
                                                var navigationEntryArt = {
                                                    moduleName: "view/simulacrum-join/simulacrum-join",
                                                    backstackVisible: false,
                                                    animated: true,
                                                    context: {
                                                        date: (dateSimulacrum.getTime() + 10000000000000000),
                                                        create: true,
                                                        currentCreate: true,
                                                        idSimulacrum: parseInt(data.response.id)
                                                    },
                                                    transition: {
                                                        name: "slideLeft",
                                                        duration: 380,
                                                        curve: "easeIn"
                                                    }
                                                };
                                                frameModule.topmost().navigate(navigationEntryArt);
                                            });*/
                                        }).catch(function (error) {
                                            pageData.set("isLoading", false);
                                            console.log(error);
                                            dialogsModule.alert({
                                                message: "No es posible guardar un simulacro, intentalo más tarde.",
                                                okButtonText: "Aceptar"
                                            });
                                            return Promise.reject();
                                        });
                                    });
                            }
                        }, function (e) {
                            viewToast("No es posible encontrar tu ubucación.");
                            pageData.set("isLoading", false);
                            console.log("Error: " + e.message);
                        });
                }


            }, function (e) {
                viewToast("Vuelve a intenerlo.");
                pageData.set("isLoading", false);
                console.log("Error: " + (e.message || e));
            });

        } else {
            alert("La hora debe ser mayor a " + dateCurrentValidate.getHours() + ":" + dateCurrentValidate.getMinutes() + " Hrs.");
        }

        console.log("FECHA ACTUAL--->" + dateCurrentValidate.getTime());
        console.log("FECHA INPUT --->" + dateInput.getTime());

    } else if (flagTime && !flagDate) {
        alert("¡Debes Selecionar una fecha!. ");
    } else if (!flagTime && flagDate) {
        alert("¡Debes selecionar una hora!.");
    } else{
        alert("¡Debes selecionar la fecha y la hora!.");
    }
    /*pageData.set("isLoading", true);
    geolocation.isEnabled().then(function (isEnabled) {
        if (!isEnabled) {
            geolocation.enableLocationRequest().then(function () {
            }, function (e) {
                console.log("Error: " + (e.message || e));
                viewToast("No puedo acceder a tu ubicación.");
            });
        } else {



            var location = geolocation.getCurrentLocation({ desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000 }).
                then(function (loc) {
                    if (loc) {
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
                            var completeDirection = JSON.stringify(data.results[0].formatted_address);
                            var datos = new Array();
                            datos["ubicacion"] = completeDirection.slice(1, -1);
                            datos["latitud"] = loc.latitude;
                            datos["longitud"] = loc.longitude;
                            datos["fecha"] = pageData.selectDate;
                            datos["hora"] = pageData.selectTime;
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
                                    var dateSimulacrum = toDate(datos["hora"], "h:m");
                                    var res = datos["fecha"].split("-");
                                    dateSimulacrum.setFullYear(parseInt(res[2]));
                                    dateSimulacrum.setMonth(parseInt(res[1] - 1));
                                    dateSimulacrum.setDate(parseInt(res[0]));
                                    var navigationEntryArt = {
                                        moduleName: "view/simulacrum-join/simulacrum-join",
                                        backstackVisible: false,
                                        animated: true,
                                        context: {
                                            date: (dateSimulacrum.getTime() + 10000000000000000),
                                            create: true,
                                            currentCreate: true,
                                            idSimulacrum: parseInt(data.response.id)
                                        },
                                        transition: {
                                            name: "slideLeft",
                                            duration: 380,
                                            curve: "easeIn"
                                        }
                                    };
                                    frameModule.topmost().navigate(navigationEntryArt);
                                });
                            }).catch(function (error) {
                                pageData.set("isLoading", false);
                                console.log(error);
                                dialogsModule.alert({
                                    message: "No es posible guardar un simulacro, intentalo más tarde.",
                                    okButtonText: "Aceptar"
                                });
                                return Promise.reject();
                            });
                        });
                    }
                }, function (e) {
                    viewToast("No es posible encontrar tu ubucación.");
                    pageData.set("isLoading", false);
                    console.log("Error: " + e.message);
                });
        }


    }, function (e) {
        viewToast("Vuelve a intenerlo.");
        pageData.set("isLoading", false);
        console.log("Error: " + (e.message || e));
    });*/
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

function toDate(dStr, format) {
    var now = new Date();
    if (format == "h:m") {
        now.setHours(dStr.substr(0, dStr.indexOf(":")));
        now.setMinutes(dStr.substr(dStr.indexOf(":") + 1));
        now.setSeconds(0);
        return now;
    } else
        return "Invalid Format";
}

exports.selectDate = function () {
    picker.pickDate({
        title: "Select Your Birthday",
        theme: "dark",
        minDate: new Date()
    }).then((result) => {
        console.log("Date is: " + result.day + "-" + result.month + "-" + result.year);
        var dateS = new Date(result.year, (result.month - 1), result.day, 0, 0, 0, 0);
        console.log(dateS);
        pageData.dateFormating = diasSemana[dateS.getDay()] + ", " + dateS.getDate() + " de " + meses[dateS.getMonth()] + " de " + dateS.getFullYear();
        pageData.selectDate = result.day + "-" + result.month + "-" + result.year;
        flagDate = true;
    }).catch((error) => {
        console.log("Error: " + error);
    });
};

exports.selectTime = function () {
    picker.pickTime({
        theme: "light",
        minTime: {
            hour: new Date().getHours(),
            minute: new Date().getMinutes()
        },
    })
        .then((result) => {
            console.log("Time is: " + result.hour + ":" + result.minute);
            pageData.hourView = result.hour;
            pageData.minutesView = result.minute;
            pageData.selectTime = result.hour + ":" + result.minute;
            flagTime = true;
        })
        .catch((error) => {
            console.log("Error: " + error);
        });
};

function definirSimulacroVoluntario(obj) {

    //console.dir(obj);

    localNotifications.schedule([{
        id: JSON.stringify(obj),
        //id: 10000000000000000 + b.getTime(),
        title: "\u00BFEst\u00e1s listo para el simulacro?",
        body: "Iniciar\u00e1 dentro de 1 minuto.",
        ticker: "Aviso de sumulacro.",
        sound: require("application").ios ? "customsound-ios.wav" : "customsound-android",
        ongoing: true,
        badge: 1,
        at: new Date(obj.dateTime - (60 * 1000))
    }]).then(function () {

    }),
        function (error) {
            console.log("scheduling error: " + error);
        };
}