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

var topmost;
var navigationOptions;
var page;
var toast;
var sismoGroupList = new SismoGroupViewModel([]);
var simulacrumVoluntrayList = new SimulacrumVoluntaryViewModel([]);
var userViewModel = new UserViewModel([]);
var idSimulacrumGroup = 0;
var vibrator = new Vibrate();
var volume = new Volume();

var pageData = new observableModule.fromObject({
    enabledCreate: null,
    simulacrumGroupList: simulacrumVoluntrayList,
    simulacrumGroupListJoin: simulacrumVoluntrayList,
    listCreate: false,
    listJoin: false
});


exports.onNavigatingTo = function(args) {
    topmost = frameModule.topmost();
    alarm = sound.create("~/sounds/alarm2.mp3");
    localNotifications.addOnMessageReceivedCallback(function (notification) {  
        console.log("Que trae notificacion en LOG");
        if (playSoundCreate === undefined) {
            console.log("NO EXISTE EL COMANDO SONAR");
            
        } else {
            console.log("EXISTE EL COMANDO SONAR");
        }
        console.log(notificationCreate);
        console.log("Que trae notificacion en DIR");
        console.dir(notificationCreate);
        var navigationEntryArt = {
            moduleName: "view/simulacrum-join/simulacrum-join",
            backstackVisible: false,
            animated: false,
            context: {
                idSG: notification.id
            },
            
        };
        frameModule.topmost().navigate(navigationEntryArt);
        }
    ).then(function () {
        //console.log("Listener added");
    });
    
    page = args.object;
    page.bindingContext = pageData;
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

function loadListCreator() {
    console.log("ENTRE A CARGAR LA LISTA CREATE");
    pageData.set("isLoading", true);
    var listView = page.getViewById("simulacrumGroupList");
    sismoGroupList.load(appSettings.getNumber("idUser")).then(function (data) {
        console.dir(data);
        //console.log((data.response.token.status === undefined));
        //var flag = (data.response.token.status == "undefined") ? false : true;
        //console.log("FLAG ---> " + flag);
        if (data.response.token.status) {
            pageData.simulacrumGroupList = data.response;
            pageData.set("isLoading", false);
            listView.animate({
                opacity: 1,
                duration: 1000
            });
            
        } else {
            navigateTopmost("view/login/login", false, true, null);
        }
        
    }).catch(function (error) {
        pageData.set("isLoading", false);
        console.log(error);
        dialogsModule.alert({
            message: "No pude procesar la petición.",
            okButtonText: "Aceptar"
        });
        return Promise.reject();
    });
}
function loadListJoin(){
    console.log("ENTRE A CARGAR LA LISTA JOIN");
    pageData.set("isLoading", true);
    var listViewJoin = page.getViewById("simulacrumGroupListJoin");
    simulacrumVoluntrayList.loadSimulacrum(appSettings.getNumber("idUser")).then(function (data) {
        console.dir(data);
        pageData.simulacrumGroupListJoin = data.response;
        pageData.set("isLoading", false);
        listViewJoin.animate({
            opacity: 1,
            duration: 1000
        });
    }).catch(function (error) {
        pageData.set("isLoading", false);
        console.log(error);
        dialogsModule.alert({
            message: "No pude procesar la petición.",
            okButtonText: "Aceptar"
        });
    });
}




exports.pullToRefreshInitiated = function () {
    //alert("Le di refrescar");
    setTimeout(function () {
        page.getViewById("simulacrumGroupList").notifyPullToRefreshFinished();
    }, 2000);
}

exports.individual = function () {
    // false, false
    navigateTopmost("view/home-simulacrum/home-simulacrum", false, false, null);
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

exports.onDrawerButtonTap = function (args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.onSelectedIndexChanged = function (args) {
    //console.log("Estoy en index ---> " + args.newIndex);
    switch (args.newIndex) {
        case 0:
            pageData.enabledCreate = true;
            loadListCreator();
            break;
        case 1:
            pageData.enabledCreate = false;
            loadListJoin();
            break;
        default:
            console.log("Esta acción no esta disponible");
            break;
    }
}

exports.onCreateSimulacrumGroup = function () {
    //console.log("ENTRE AQUI IOS");
    navigateTopmost("view/add-simulacrum-group/add-simulacrum-group", false, false);
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

                                sismoGroupList.searchByFolio(r.text).then(function (data) {
                                    console.log("Buscando Simulacro grupal por folio");
                                    console.dir(data);
                                    if (data.response.length > 0) {

                                        if (parseInt(data.response[0].idVoluntarioCreador) === appSettings.getNumber("idUser")) {
                                            dialogsModule.alert({
                                                message: "No te es posible participar.",
                                                okButtonText: "Aceptar"
                                            });
                                        } else {
                                            console.log("Si puedo participar");
                                            var b = toDate(data.response[0].hora, "h:m");
                                            var res = data.response[0].fecha.split("-");

                                            b.setFullYear(parseInt(res[2]));
                                            b.setMonth(parseInt(res[1] - 1));
                                            b.setDate(parseInt(res[0]));

                                            var currentDate = new Date();
                                            if (currentDate <= b) {
                                                console.log("Estoy a timepo para entrar al simulacro");
                                                loc2.latitude = data.response[0].latitud;
                                                loc2.longitude = data.response[0].longitud;

                                                var datos = new Array();
                                                datos['idVoluntario'] = appSettings.getNumber("idUser");
                                                datos['idSimulacro'] = parseInt(data.response[0].id);
                                                datos['tiempo_inicio'] = "";
                                                datos['tiempo_estoy_listo'] = "";
                                                datos['mensajeVoluntario'] = "";
                                                datos['tipoSimulacro'] = "unido";
                                                datos['altitud'] = loc.verticalAccuracy;
                                                datos['tagVoluntario'] = "";

                                                

                                                //console.log("FECHA --->" + b.toString());

                                                simulacrumVoluntrayList.addVoluntarySimulacrum(datos).then(function (responseSaveVoluntary) {
                                                    console.dir(responseSaveVoluntary);
                                                    idSimulacrumGroup = parseInt(responseSaveVoluntary.response.idVoluntarioSimulacro);
                                                    if (responseSaveVoluntary.response.status) {
                                                        //console.log("TARDARA EN INICIAR -----> ");
                                                        //console.log((b.getTime() - 120000) - (new Date().getTime()));
                                                        //console.log(new Date((b.getTime()) - (new Date().getTime()) + new Date().getTime()).toString());

                                                        //notificationCreate = setTimeout(programerNotification, (b.getTime() - 120000) - (new Date().getTime()));
                                                        programerNotificacionTest((b.getTime() - 120000));
                                                        playSoundCreate = setTimeout(programerSound, (b.getTime()) - (new Date().getTime()));
                                                        changeActivity = setTimeout(navigateActivitySimulacrumJoin, ((b.getTime() + 1000) - (new Date().getTime())));

                                                        appSettings.setNumber("idSimulacrumGroup", parseInt(responseSaveVoluntary.response.idVoluntarioSimulacro));
                                                        dialogsModule.alert({
                                                            title: "Informaci\u00F3n",
                                                            message: "Te has unido al simulacro " + data.response[0].folioSimulacro,
                                                            okButtonText: "Aceptar"
                                                        }).then(function () {
                                                            var navigationEntryArt = {
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
                                                            frameModule.topmost().navigate(navigationEntryArt);
                                                        });

                                                    } else {
                                                        dialogsModule.alert({
                                                            message: "No es posible unirse al simulacro, intentalo más tarde.",
                                                            okButtonText: "Aceptar"
                                                        });
                                                    }
                                                }).catch(function (error) {
                                                    dialogsModule.alert({
                                                        message: "No pude procesar la petición.",
                                                        okButtonText: "Aceptar"
                                                    });
                                                });

                                            } else {
                                                dialogsModule.alert({
                                                    message: "Ya no es posible unirte al simulacro.",
                                                    okButtonText: "Aceptar"
                                                });
                                            }
                                        }

                                        
                                    } else {
                                        dialogsModule.alert({
                                            message: "No se encontró el simulacro con el folio: " + r.text + ".",
                                            okButtonText: "Aceptar"
                                        });
                                    }
                                }).catch(function (error) {
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

exports.cancel = function (args) {
    var item = args.view.bindingContext;
    var index = sismoGroupList.indexOf(item);
    dialogsModule.confirm({
        title: "Aviso",
        message: "\u00BFEstás seguro que deseas salir del simulacro?",
        okButtonText: "Si",
        cancelButtonText: "No",
    }).then(function (result) {
        if (result) {
            var datos = new Array();
            datos['idVoluntario'] = item.idVoluntario;
            datos['idSimulacro'] = item.idSimulacro;
            simulacrumVoluntrayList.deleteVoluntary(datos).then(function (responseData) {
                //console.dir(responseData.response.respuesta.status);
                clearTimeout(time);
                if (responseData.response.respuesta.status) {
                    loadList();
                    localNotifications.getScheduledIds().then(
                        function (ids) {
                            ids.forEach(function (notification) {
                                var JsonNotify = JSON.parse(notification);
                                if (JsonNotify.idSimulacrum == item.idSimulacro && item.idVoluntario == JsonNotify.idVoluntario) {
                                    localNotifications.cancel(JSON.stringify(JsonNotify)).then(
                                        function (foundAndCanceled) {
                                            if (foundAndCanceled) {
                                                console.log("OK, it's gone!");
                                            } else {
                                                console.log("No ID " + JSON.stringify(JsonNotify) + " was scheduled");
                                            }
                                        }
                                    )
                                }

                            });
                            console.log("ID's: " + ids.length);


                        }
                    );
                } else {
                    dialogsModule.alert({
                        message: "No es posible cancelar el simulacro.",
                        okButtonText: "Aceptar"
                    });
                    //alert("No es posible cancelar el simulacro.");
                }
            });
            
        }
    });
}


exports.delete = function (args) {
    var item = args.view.bindingContext;
    dialogsModule.confirm({
        title: "Aviso",
        message: "¿Estás seguro que deseas eliminar el simulacro?",
        okButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then(function (result) {
        if (result) {
            sismoGroupList.delete(item.idSimulacro).then(function (data) {
                //console.dir(data);
                clearTimeout(time);
                if (data.response.simulacro.status) {
                    loadList();
                    localNotifications.getScheduledIds().then(function (ids) {
                        ids.forEach(function (notification) {
                            var JsonNotify = JSON.parse(notification);
                            if (JsonNotify.idSimulacrum == item.idSimulacro) {
                                localNotifications.cancel(JSON.stringify(JsonNotify)).then(function (foundAndCanceled) {
                                    if (foundAndCanceled) {
                                        console.log("OK, it's gone!");
                                    } else {
                                        console.log("No ID " + JSON.stringify(JsonNotify) + " was scheduled");
                                    }
                                });
                            }

                        });
                        console.log("ID's: " + ids.length);
                    });
                }
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

exports.listViewItemTap = function (args) {
    var item = args.view.bindingContext;
    var index = pageData.simulacrumGroupList.indexOf(item);
    console.dir(item);
    console.log("CREADO");
    /*var res = item.fecha.split("-");
    var dateSimulacrum = toDate(item.hora, "h:m");
    dateSimulacrum.setFullYear(parseInt(res[2]));
    dateSimulacrum.setMonth(parseInt(res[1] - 1));
    dateSimulacrum.setDate(parseInt(res[0]));

    var myObj = JSON.stringify({
        dateTime: dateSimulacrum.getTime(),
        idVoluntarySimulacrum: parseInt(item.id),
        idSimulacrum: parseInt(item.idSimulacro),
        typeVoluntary: 'create'
    });
    

    if (item.tiempo_inicio === "00:00:00") {
        var navigationEntryArt = {
            moduleName: "view/simulacrum-join/simulacrum-join",
            backstackVisible: true,
            clearHistory: false,
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
        
    }*/
}

exports.listViewItemTapJoin = function (args) {
    var item = args.view.bindingContext;
    var index = pageData.simulacrumGroupList.indexOf(item);
    console.dir(item);
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

function programerNotification() {
    //console.log(idSimulacrumGroup);
    //clearInterval(notificationCreate);
    localNotifications.schedule([{
        id: idSimulacrumGroup,
        title: "\u00BFEst\u00e1s listo para el simulacro?",
        body: "Iniciar\u00e1 dentro de 2 minuto.",
        ticker: "Aviso de sumulacro.",
        sound: require("application").ios ? "customsound-ios.wav" : "customsound-android",
        ongoing: true,
        badge: 1,
        at: new Date(new Date().getTime())
    }]).then(function () {
        console.log("Notificacion programada");
    }),
    function (error) {
        console.log("scheduling error: " + error);
    };
}

function programerNotificacionTest(time) {
    localNotifications.schedule([{
        id: idSimulacrumGroup,
        title: "\u00BFEst\u00e1s listo para el simulacro?",
        body: "Iniciar\u00e1 dentro de 2 minuto.",
        ticker: "Aviso de sumulacro.",
        sound: require("application").ios ? "customsound-ios.wav" : "customsound-android",
        ongoing: true,
        badge: 1,
        at: new Date(time)
    }]).then(function () {
        console.log("Notificacion programada");
    }),
    function (error) {
        console.log("scheduling error: " + error);
    };
}

function programerSound() {
    var installed = openApp("org.nativescript.voluntario");
    if (installed) {
        
        if (application.ios) {
            // iOS Volume goes from 0 to 1. With its increments being 1/16.
            volume.setVolume(7);
        } else if (application.android) {
            // Android Volume I'm unsure of the range, but believe it to be 0 to 15 at least for the music stream.
            volume.setVolume(7);
        }
        vibrator.vibrate(3000);
        loopSound = setInterval(playMusic, 500);
        //navigateTopmost("view/simulacrum-join/simulacrum-join", false, true, appSettings.getNumber("idSimulacrumGroup"));
        //console.log("NAVEGACION");
        //navegacionApp(idSimulacrumGroup);
    } else {
        viewToast("No tegno instalado la app.");
    }
}

function navigateActivitySimulacrumJoin() {
    console.log("ID DE SIMULACRO GRUPO ---------> " + appSettings.getNumber("idSimulacrumGroup"));
    navigateTopmost("view/simulacrum-join/simulacrum-join", false, true, appSettings.getNumber("idSimulacrumGroup"));
}

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

function playMusic() {
    alarm.play();
}

function navegacionApp(idSimulacroGrupo) {
    console.log("Voy a la navegacion");
    var navigationEntryArtStart = {
        moduleName: "view/simulacrum-join/simulacrum-join",
        backstackVisible: false,
        animated: false,
        context: {
            idSG: idSimulacroGrupo
        },
        /*transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }*/
    };
    frameModule.topmost().navigate(navigationEntryArtStart);
    console.log("Termino la navegacion");
}

exports.menuCreate = function (args) {
    var item = args.view.bindingContext;
    dialogsModule.action({
        cancelButtonText: "Cancel text",
        actions: ["Cancelar", "Option2"]
    }).then(function (result) {
        console.log("Dialog result: " + result);
        if (result == "Options1") {
            //Do action1
        } else if (result == "Option2") {
            //Do action2
        }
    });
}

exports.menuJoin = function (args) {
    var item = args.view.bindingContext;
    dialogsModule.action({
        message: "Your message",
        cancelButtonText: "Cancel text",
        actions: ["Option1", "Option2"]
    }).then(function (result) {
        console.log("Dialog result: " + result);
        if (result == "Options1") {
            //Do action1
        } else if (result == "Option2") {
            //Do action2
        }
    });
}