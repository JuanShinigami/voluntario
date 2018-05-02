const application = require("application");
var frameModule = require("ui/frame");
var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var SimulacrumVoluntaryViewModel = require("../../shared/view-models/simulacrum-voluntary-view-model");
var UserViewModel = require("../../shared/view-models/user-view-model");
var Toast = require("nativescript-toast");
var geolocation = require("nativescript-geolocation");
var localNotifications = require("nativescript-local-notifications");
var openApp = require("nativescript-open-app").openApp;
var Vibrate = require("nativescript-vibrate").Vibrate;
var sound = require("nativescript-sound");
var Volume = require("nativescript-volume").Volume;
var SocialShare = require("nativescript-social-share");
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;

var topmost;
var navigationOptions;
var page;
var toast;
var sismoGroupList = new SismoGroupViewModel([]);
var simulacrumVoluntrayList = new SimulacrumVoluntaryViewModel([]);
var userViewModel = new UserViewModel([]);
var idVoluntarySimulacrum = 0;
var vibrator = new Vibrate();
var volume = new Volume();
var loader = new LoadingIndicator();
var optionsDialogModal = null;

var pageData = new observableModule.fromObject({
    simulacrumGroupListJoin: simulacrumVoluntrayList,
    listJoin: false
});


exports.onNavigatingTo = function (args) {
    topmost = frameModule.topmost();
    alarm = sound.create("~/sounds/alarm2.mp3");
    page = args.object;
    page.bindingContext = pageData;
    loadListJoin();
    testGPS();
}

function testGPS() {
    geolocation.isEnabled().then(function (isEnabled) {
        if (!isEnabled) {
            geolocation.enableLocationRequest().then(function () {

            }, function (e) {
                console.log("Error: " + (e.message || e));

            });
        } else {
        }
    }, function (e) {
        viewToast("No puedo acceder a tu ubicación.");
        console.log("Error: " + (e.message || e));
    });
}


function loadListJoin() {
    //console.log("ENTRE A CARGAR LA LISTA JOIN");
    pageData.set("isLoading", true);
    var listViewJoin = page.getViewById("simulacrumGroupListJoin");
    simulacrumVoluntrayList.loadSimulacrum(appSettings.getNumber("idUser")).then(function (data) {
        //console.log("IntegrateModel");
        console.dir(data);
        if (data.response.StatusToken.status) {

            if (data.response.detalleVoluntarioPorCreador.length <= 0) {
                pageData.listJoin = true;
            } else {
                pageData.simulacrumGroupListJoin = data.response.detalleVoluntarioPorCreador;
            }
            pageData.set("isLoading", false);
            listViewJoin.animate({
                opacity: 1,
                duration: 1000
            });
        } else {
            expireToken();
        }

    }).catch(function (error) {
        pageData.set("isLoading", false);
        console.log(error);
        dialogsModule.alert({
            message: "No pude procesar la petición.",
            okButtonText: "Aceptar"
        });
    });
}

function navigateTopmost(nameModule, backstack, clearHistory, JSONbody) {
    navigationOptions = {
        moduleName: nameModule,
        backstackVisible: backstack,
        clearHistory: clearHistory,
        animated: true,
        context: {
            idSG: JSONbody,
        },
        transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }
    };
    topmost.navigate(navigationOptions);
}

exports.join = function () {
    //definirSimulacroVoluntario(new Date());
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
                    console.log(JSON.stringify(loc));

                    var loc2 = loc;
                    dialogsModule.prompt({
                        title: "Informaci\u00F3n",
                        message: "Ingresa el folio del simulacro",
                        okButtonText: "Unirme",
                        cancelButtonText: "Cancelar"
                    }).then(function (r) {
                        if (r.result) {
                            if (r.text.length > 0) {
                                pageData.set("isLoading", true);
                                sismoGroupList.searchByFolio(r.text).then(function (data) {
                                    console.log("Buscando Simulacro grupal por folio");
                                    console.dir(data);
                                    if (data.response.StatusToken.status) {


                                        if (data.response.detalleSimulacroFolio.length > 0) {

                                            if (parseInt(data.response.detalleSimulacroFolio[0].idVoluntarioCreador) === appSettings.getNumber("idUser")) {
                                                dialogsModule.alert({
                                                    message: "No te es posible participar.",
                                                    okButtonText: "Aceptar"
                                                });
                                            } else {
                                                console.log("Si puedo participar");
                                                var b = toDate(data.response.detalleSimulacroFolio[0].hora, "h:m");
                                                var res = data.response.detalleSimulacroFolio[0].fecha.split("-");

                                                b.setFullYear(parseInt(res[0]));
                                                b.setMonth(parseInt(res[1] - 1));
                                                b.setDate(parseInt(res[2]));

                                                var currentDate = new Date();
                                                if (currentDate <= b) {
                                                    console.log("Estoy a timepo para entrar al simulacro");
                                                    loc2.latitude = data.response.detalleSimulacroFolio[0].latitud;
                                                    loc2.longitude = data.response.detalleSimulacroFolio[0].longitud;

                                                    var datos = new Array();
                                                    datos['idVoluntario'] = appSettings.getNumber("idUser");
                                                    datos['idSimulacro'] = parseInt(data.response.detalleSimulacroFolio[0].id);
                                                    datos['tiempo_inicio'] = "";
                                                    datos['tiempo_estoy_listo'] = "";
                                                    datos['mensajeVoluntario'] = "";
                                                    datos['tipoSimulacro'] = "unido";
                                                    datos['altitud'] = loc.verticalAccuracy;
                                                    datos['tagVoluntario'] = "";



                                                    //console.log("FECHA --->" + b.toString());

                                                    simulacrumVoluntrayList.addVoluntarySimulacrum(datos).then(function (responseSaveVoluntary) {
                                                        console.log("Hice la insersion de unirse");
                                                        console.dir(responseSaveVoluntary);
                                                        idVoluntarySimulacrum = parseInt(responseSaveVoluntary.response.voluntarioSimulacro.idVoluntarioSimulacro);

                                                        if (responseSaveVoluntary.response.voluntarioSimulacro.status) {
                                                            //console.log("TARDARA EN INICIAR -----> ");
                                                            //console.log((b.getTime() - 120000) - (new Date().getTime()));
                                                            //console.log(new Date((b.getTime()) - (new Date().getTime()) + new Date().getTime()).toString());

                                                            //notificationCreate = setTimeout(programerNotification, (b.getTime() - 120000) - (new Date().getTime()));
                                                            programerNotificacionTest((b.getTime() - 120000));
                                                            playSoundCreate = setTimeout(programerSound, (b.getTime()) - (new Date().getTime()));
                                                            changeActivity = setTimeout(navigateActivitySimulacrumJoin, ((b.getTime() + 500) - (new Date().getTime())));

                                                            //appSettings.setNumber("idSimulacrumGroup", parseInt(data.response.detalleSimulacroFolio[0].id);
                                                            dialogsModule.alert({
                                                                title: "Informaci\u00F3n",
                                                                message: "Te has unido al simulacro " + data.response.detalleSimulacroFolio[0].folioSimulacro + ".",
                                                                okButtonText: "Aceptar"
                                                            }).then(function () {
                                                                /*var navigationEntryArt = {
                                                                    moduleName: "view/simulacrum-join/simulacrum-join",
                                                                    backstackVisible: false,
                                                                    animated: true,
                                                                    context: {
                                                                        idSG: idSimulacrumGroup
                                                                    },
                                                                    transition: {
                                                                        name: "slideLeft",
                                                                        duration: 380,
                                                                        curve: "easeIn"
                                                                    }
                                                                };
                                                                frameModule.topmost().navigate(navigationEntryArt);*/
                                                                //viewToast("")
                                                                pageData.set("isLoading", false);
                                                                navigateTopmost("view/group-join-simulacrum/group-join-simulacrum", false, true, null);
                                                            });

                                                        } else {
                                                            pageData.set("isLoading", false);
                                                            dialogsModule.alert({
                                                                message: "No es posible unirse al simulacro, intentalo más tarde.",
                                                                okButtonText: "Aceptar"
                                                            });
                                                        }
                                                    }).catch(function (error) {
                                                        pageData.set("isLoading", false);
                                                        dialogsModule.alert({
                                                            message: "No pude procesar la petición.",
                                                            okButtonText: "Aceptar"
                                                        });
                                                    });

                                                } else {
                                                    pageData.set("isLoading", false);
                                                    dialogsModule.alert({
                                                        message: "Ya no es posible unirte al simulacro.",
                                                        okButtonText: "Aceptar"
                                                    });
                                                }
                                            }


                                        } else {
                                            pageData.set("isLoading", false);
                                            dialogsModule.alert({
                                                message: "No se encontró el simulacro con el folio: " + r.text + ".",
                                                okButtonText: "Aceptar"
                                            });
                                        }

                                    } else {
                                        expireToken();
                                    }
                                }).catch(function (error) {
                                    pageData.set("isLoading", false);
                                    dialogsModule.alert({
                                        message: "No pude procesar la petición.",
                                        okButtonText: "Aceptar"
                                    });
                                    return Promise.reject();
                                });

                            } else {
                                dialogsModule.alert({
                                    message: "Debe de ingresar el folio.",
                                    okButtonText: "Aceptar"
                                });
                            }
                        }
                    });


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


}

exports.delete = function (args) {
    var item = args.view.bindingContext;
    console.dir(item);
    dialogsModule.confirm({
        title: "Aviso",
        message: "¿Estás seguro que deseas eliminar el simulacro?",
        okButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then(function (result) {
        if (result) {
            sismoGroupList.delete(item.id).then(function (dataResponse) {
                console.dir(dataResponse);
                if (dataResponse.response.StatusToken.status) {
                    if (dataResponse.response.simulacro.status) {
                        loadListJoin();
                        loadListCreator();
                    }
                } else {
                    expireToken();
                }
                //clearTimeout(time);
                /*if (data.response.simulacro.status) {
                    loadListJoin
                    loadListCreator();
                }*/
            }).catch(function (error) {
                console.log(error);
                viewToast("No es posible eliminar el simulacro.");
                return Promise.reject();
            });
        }
    });
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

exports.listViewItemTapJoin = function (args) {
    var item = args.view.bindingContext;
    var index = pageData.simulacrumGroupListJoin.indexOf(item);
    console.dir(item);
    if (item.estatus == "Completada") {
        dialogsModule.action({
            cancelButtonText: "Cancelar",
            actions: [" * Ver detalles"]
        }).then(function (result) {
            //console.log("Dialog result: " + result);
            switch (result) {
                case " * Ver detalles":
                    console.log("Ver detalles");
                    var navigationEntryArt = {
                        moduleName: "view/view-detail-simulacrum/view-detail-simulacrum",
                        backstackVisible: false,
                        animated: true,
                        context: {
                            item: item,
                        },
                        transition: {
                            name: "slideLeft",
                            duration: 380,
                            curve: "easeIn"
                        }
                    };
                    frameModule.topmost().navigate(navigationEntryArt);
                    break;
                default:
                    console.log("No existe esta opcion");
            }
        });
    }
    /*var res = item.fecha.split("-");
    var dateSimulacrum = toDate(item.hora, "h:m");
    dateSimulacrum.setFullYear(parseInt(res[2]));
    dateSimulacrum.setMonth(parseInt(res[1] - 1));
    dateSimulacrum.setDate(parseInt(res[0]));

    var myObj = JSON.stringify({
        dateTime: dateSimulacrum.getTime(),
        idVoluntarySimulacrum: parseInt(item.id),
        //idVoluntary: appSettings.getNumber("idUser"),
        idSimulacrum: parseInt(item.idSimulacro),
        typeVoluntary: 'join'
    });

    //console.log("lO QUE FALTA ---> " + (dateSimulacrum.getTime() - new Date().getTime()));
    if ((dateSimulacrum.getTime() - new Date().getTime()) > 0) {
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
    } else {
        if (item.tiempo_inicio != "") {
            var navigationEntryArt = {
                moduleName: "view/view-detail-simulacrum/view-detail-simulacrum",
                backstackVisible: false,
                animated: true,
                context: {
                    item: item,
                },
                transition: {
                    name: "slideLeft",
                    duration: 380,
                    curve: "easeIn"
                }
            };
            frameModule.topmost().navigate(navigationEntryArt);
        } else {
            dialogsModule.alert({
                message: "Simulacro no disponible.",
                okButtonText: "Aceptar"
            });
        }
    }*/

}

function programerNotificacionTest(time) {
    localNotifications.schedule([{
        id: idVoluntarySimulacrum,
        title: "\u00BFEst\u00e1s listo para el simulacro?",
        body: "Pronto iniciar\u00E1 el simlacro. Da clic para confirmar que pariticipar\u00E1s",
        ticker: "Aviso de sumulacro.",
        sound: require("application").ios ? "customsound-ios.wav" : "customsound-android",
        ongoing: true,
        badge: 1,
        interval: 'second',
        at: new Date(time)
    }]).then(function () {
        console.log("Notificacion programada");
    }),
        function (error) {
            console.log("scheduling error: " + error);
        };
}

function programerSound() {
    localNotifications.cancel(idVoluntarySimulacrum).then(
        function (foundAndCanceled) {
            if (foundAndCanceled) {
                console.log("Notificacion cancelada...");
            } else {
                console.log("No ID 5 was scheduled");
            }
        }
    )
    console.log("AQUI PROGRAMO EL SOUND");
    console.log("CONFIG LOGIN --------------------> ----------------> " + config.login);
    if (config.login != "undefined") {
        var installed = openApp("org.nativescript.voluntario");
        if (installed) {
            if (application.ios) {
                // iOS Volume goes from 0 to 1. With its increments being 1/16.
                volume.setVolume(7);
            } else if (application.android) {
                // Android Volume I'm unsure of the range, but believe it to be 0 to 15 at least for the music stream.
                volume.setVolume(7);
            }
            //vibrator.vibrate(2000);
            loopSound = setInterval(playMusic, 500);
        }
    } else {
        if (application.ios) {
            // iOS Volume goes from 0 to 1. With its increments being 1/16.
            volume.setVolume(7);
        } else if (application.android) {
            // Android Volume I'm unsure of the range, but believe it to be 0 to 15 at least for the music stream.
            volume.setVolume(7);
        }
        vibrator.vibrate(2000);
        loopSound = setInterval(playMusic, 500);
    }
}

function navigateActivitySimulacrumJoin() {
    //console.log("ID DE SIMULACRO GRUPO ---------> " + appSettings.getNumber("idSimulacrumGroup"));
    console.log("IDE QUE TRAIGO --------------> " + idVoluntarySimulacrum);
    var navigationEntryArtJoin = {
        moduleName: "view/simulacrum-join/simulacrum-join",
        backstackVisible: false,
        animated: true,
        context: {
            idSG: idVoluntarySimulacrum,
        },
        transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }
    };
    frameModule.topmost().navigate(navigationEntryArtJoin);
}

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

function playMusic() {
    alarm.play();
}

function expireToken() {
    console.log("1");
    //viewToast("Sesión expirada.");
    if (appSettings.hasKey("login")) {
        appSettings.remove("login");
        console.log("2");
    }
    console.log("3");
    if (appSettings.hasKey("emailUser")) {
        appSettings.remove("emailUser");
        console.log("4");
    }
    //appSettings.remove("folioUser");

    console.log("5");
    if (appSettings.hasKey("nameUser")) {
        appSettings.remove("nameUser");
        console.log("6");
    }

    console.log("7");
    if (appSettings.hasKey("idUser")) {
        console.log("8");
        appSettings.remove("idUser");
    }
    console.log("9");
    if (appSettings.hasKey("tokenUser")) {
        console.log("10");
        appSettings.remove("tokenUser");
    }
    console.log("11");
    //appSettings.remove("phoneUser");
    //alert("Cerrar Sesion");
    var navigationEntryArtView = {
        moduleName: "view/login/login",
        backstackVisible: false,
        clearHistory: true,
        animated: true,
        transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }
    };
    frameModule.topmost().navigate(navigationEntryArtView);
    //navigateTopmost("view/login/login", false, true, null);
}

function cargarOptions(textEncabezado) {
    optionsDialogModal = {
        message: textEncabezado,
        progress: 0.65,
    };
}

exports.back = function () {
    navigateTopmost("view/principal-secondary/principal-secondary", false, false, null);
}