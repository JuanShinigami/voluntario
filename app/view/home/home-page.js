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

var topmost;
var navigationOptions;
var page;
var toast;
var sismoGroupList = new SismoGroupViewModel([]);
var simulacrumVoluntrayList = new SimulacrumVoluntaryViewModel([]);
var userViewModel = new UserViewModel([]);


var pageData = new observableModule.fromObject({
    enabledCreate: null,
    simulacrumGroupList: simulacrumVoluntrayList,
    simulacrumGroupListJoin: simulacrumVoluntrayList,
    listCreate: false,
    listJoin: false
});


exports.onNavigatingTo = function(args) {
    topmost = frameModule.topmost();
    localNotifications.addOnMessageReceivedCallback(function (notification) {  
        var navigationEntryArt = {
            moduleName: "view/simulacrum-join/simulacrum-join",
            backstackVisible: false,
            animated: true,
            context: {
                data: JSON.parse(notification.id)
            },
            transition: {
                name: "slideLeft",
                duration: 380,
                curve: "easeIn"
            }
        };
        frameModule.topmost().navigate(navigationEntryArt);
        }
    ).then(function () {
        console.log("Listener added");
    });
    
    page = args.object;
    page.bindingContext = pageData;
    testGPS();
}

function testGPS() {
    geolocation.isEnabled().then(function (isEnabled) {
        if (!isEnabled) {
            geolocation.enableLocationRequest().then(function () {
                viewToast("Tenemos acceso a tu ubicación.");
            }, function (e) {
                console.log("Error: " + (e.message || e));
                //viewToast("No puedo acceder a tu ubicación.");
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
        pageData.simulacrumGroupList = data.response;
        pageData.set("isLoading", false);
        listView.animate({
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
        return Promise.reject();
    });
}
function loadListJoin(){
    console.log("ENTRE A CARGAR LA LISTA JOIN");
    pageData.set("isLoading", true);
    var listViewJoin = page.getViewById("simulacrumGroupListJoin");
    simulacrumVoluntrayList.loadSimulacrum(appSettings.getNumber("idUser")).then(function (data) {
        console.dir(data);
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
        return Promise.reject();
    });
}


/*function loadList() {
    
    pageData.set("isLoading", true);
    
    var listView = page.getViewById("simulacrumGroupList");
    simulacrumVoluntrayList.loadSimulacrum(appSettings.getNumber("idUser")).then(function (data) {
        console.dir(data);
        //console.log(data.response.listSimulacrumCreate.length);
        //console.log(data.response.listSimulacrumJoin.length);
        if (data.response.listSimulacrumCreate.length <= 0) {
            pageData.listCreate = true;
        } else {
            pageData.listCreate = false;
        }

        if (data.response.listSimulacrumJoin.length <= 0) {
            pageData.listJoin = true;
        } else {
            pageData.listJoin = false;
        }
        pageData.simulacrumGroupList = data.response.listSimulacrumCreate;
        pageData.simulacrumGroupListJoin = data.response.listSimulacrumJoin;
        pageData.set("isLoading", false);
        listView.animate({
            opacity: 1,
            duration: 1000
        });
    }).catch(function (error) {
        pageData.set("isLoading", false);
        console.log(error);
        dialogsModule.alert({
            message: "No pude procesar la petición.",
            okButtonText: "OK"
        });
        return Promise.reject();
    });

}*/

exports.pullToRefreshInitiated = function () {
    //alert("Le di refrescar");
    setTimeout(function () {
        page.getViewById("simulacrumGroupList").notifyPullToRefreshFinished();
    }, 2000);
}

exports.individual = function () {
    // false, false
    navigateTopmost("view/home-simulacrum/home-simulacrum", false, false);
}

exports.group = function () {
    
    dialogsModule.action({
        message: "\u00BFQué acción desea realizar?",
        cancelButtonText: "Cancelar",
        actions: ["Crear", "Unirse"]
    }).then(function (result) {
        switch (result) {
            case "Crear":
                config.flag = true;
                config.titleBarListSimulacrumGroup = "Simulacros creados";
                navigateTopmost("view/list-simulacrum-group/list-simulacrum-group", true, false);
                break;
            case "Unirse":
                config.flag = false;
                config.titleBarListSimulacrumGroup = "Participación";
                navigateTopmost("view/list-simulacrum-group/list-simulacrum-group", true, false);
                break;
            default:
                break;
        }
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
                                    console.dir(data);
                                    if (data.response.length > 0) {

                                        if (parseInt(data.response[0].idVoluntarioCreador) === appSettings.getNumber("idUser")) {
                                            dialogsModule.alert({
                                                message: "No te es posible participar.",
                                                okButtonText: "Aceptar"
                                            });
                                        } else {
                                            var b = toDate(data.response[0].hora, "h:m");
                                            var res = data.response[0].fecha.split("-");

                                            b.setFullYear(parseInt(res[2]));
                                            b.setMonth(parseInt(res[1] - 1));
                                            b.setDate(parseInt(res[0]));

                                            var currentDate = new Date();
                                            if (currentDate <= b) {
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

                                                simulacrumVoluntrayList.addVoluntarySimulacrum(datos).then(function (responseSaveVoluntary) {
                                                    console.dir(responseSaveVoluntary);
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
                    localNotifications.getScheduledIds().then(
                        function (ids) {
                            ids.forEach(function (notification) {
                                var JsonNotify = JSON.parse(notification);
                                if (JsonNotify.idSimulacrum == item.idSimulacro) {
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

function definirSimulacroVoluntario(obj) {

    //console.dir(obj);

    localNotifications.schedule([{
        id: JSON.stringify(obj),
        //id: 10000000000000000 + b.getTime(),
        title: "\u00BFEst\u00e1s listo para el simulacro?",
        body: "Iniciar\u00e1 en menos de 1 minuto.",
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
    //console.dir(item);
    var res = item.fecha.split("-");
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
    }

}

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}