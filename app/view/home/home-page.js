var frameModule = require("ui/frame");
var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var SimulacrumVoluntaryViewModel = require("../../shared/view-models/simulacrum-voluntary-view-model");
var Toast = require("nativescript-toast");
var geolocation = require("nativescript-geolocation");
var localNotifications = require("nativescript-local-notifications");

var topmost;
var navigationOptions;
var page;
var toast;
var sismoGroupList = new SismoGroupViewModel([]);
var simulacrumVoluntrayList = new SimulacrumVoluntaryViewModel([]);


var pageData = new observableModule.fromObject({
    enabledCreate: null,
    simulacrumGroupList: simulacrumVoluntrayList,
    simulacrumGroupListJoin: simulacrumVoluntrayList
});


exports.onNavigatingTo = function(args) {
    topmost = frameModule.topmost();

    // OPCIONES DE NAVEGACION
    /*var navigationEntryArt = {
        moduleName: "view/simulacrum-join/simulacrum-join",
        backstackVisible: false,
        animated: true,
        context: {
            date: new Date(new Date().getTime() - (5 * 1000))
        },
        transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }
    };
    // Dirigimos a la vista de articulos
    frameModule.topmost().navigate(navigationEntryArt);*/
    //navigateTopmost("view/simulacrum-join/simulacrum-join", true, false);
    localNotifications.addOnMessageReceivedCallback(
        function (notification) {
            var navigationEntryArt = {
                moduleName: "view/simulacrum-join/simulacrum-join",
                backstackVisible: false,
                animated: true,
                context: {
                    date: notification.id
                },
                transition: {
                    name: "slideLeft",
                    duration: 380,
                    curve: "easeIn"
                }
            };
            frameModule.topmost().navigate(navigationEntryArt);
            console.log("ID: " + notification.id);
            console.log("Title: " + notification.title);
            console.log("Body: " + notification.body);
            console.log("Time : " + notification.groupedMessages);
            
        }
    ).then(function () {
        console.log("Listener added");
    });
    
    page = args.object;
    
    page.bindingContext = pageData;

    loadList();
}

function loadList() {
    
    
    //console.log("LALAL-->" + appSettings.getNumber("idUser"));
    pageData.set("isLoading", true);
    var listView = page.getViewById("simulacrumGroupList");
    simulacrumVoluntrayList.loadSimulacrum(appSettings.getNumber("idUser")).then(function (data) {
        console.dir(data);
        //data.response.forEach(function (element) {
        //    console.dir(element);
        //});
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
    console.log("Estoy en index ---> " + args.newIndex);
    switch (args.newIndex) {
        case 0:
            pageData.enabledCreate = true;
            loadListSimulacrum(args.newIndex);
            break;
        case 1:
            pageData.enabledCreate = false;
            loadListSimulacrum(args.newIndex);
            break;
        default:
            console.log("Esta acción no esta disponible");
            break;
    }
}

function loadListSimulacrum(identify) {
    
}

exports.onCreateSimulacrumGroup = function () {
    navigateTopmost("view/add-simulacrum-group/add-simulacrum-group", false, false);
}

exports.join = function () {
    //console.log("Unirme");

    geolocation.isEnabled().then(function (isEnabled) {
        if (!isEnabled) {
            geolocation.enableLocationRequest().then(function () {
            }, function (e) {
                console.log("Error: " + (e.message || e));
                viewToast("No puedo acceder a tu ubicación.");
            });
        } else {
            //console.log("aqui 1");
            var location = geolocation.getCurrentLocation({ desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000 }).
                then(function (loc) {
                    if (loc) {
                        //console.dir(loc);
                        var loc2 = loc;

                        dialogsModule.prompt({
                            title: "Informaci\u00F3n",
                            message: "Ingresa el folio del simulacro",
                            okButtonText: "Unirme",
                            cancelButtonText: "Cancelar"
                        }).then(function (r) {
                            console.log("Dialog result: " + r.result + ", text: " + r.text);
                            if (r.result) {
                                if (r.text.length > 0) {
                                    userViewModel.searchFolio(r.text).then(function (responseSearchFolio) {
                                        sismoGroupList.load(parseInt(responseSearchFolio.response[0].id)).then(function (responseList) {
                                            responseList.response.forEach(function (simulacrumGroup) {
                                                console.log(simulacrumGroup.hora);
                                                var currentDate = new Date();
                                                if (simulacrumGroup.fecha === currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() && simulacrumGroup.estatus === "Creada") {
                                                    loc2.latitude = simulacrumGroup.latitud;
                                                    loc2.longitude = simulacrumGroup.longitud;
                                                    if (geolocation.distance(loc, loc2) < 5) {
                                                        alert("Si puedo unirme al simulacro");
                                                        var datos = new Array();
                                                        datos['idVoluntario'] = 12456795;
                                                        datos['idSimulacro'] = simulacrumGroup.id;
                                                        datos['tiempo_inicio'] = "";
                                                        datos['tiempo_estoy_listo'] = "";
                                                        datos['mensajeVoluntario'] = "";
                                                        var b = toDate(simulacrumGroup.hora, "h:m");
                                                        //config.dateSimulacrum = b;
                                                        console.log("HORA --> " + b.getHours() + "Minutos --> " + b.getMinutes());
                                                        //console.dir(b);
                                                        definirSimulacroVoluntario(b);
                                                        /*simulacrumVoluntaryViewModel.addVoluntary(datos).then(function (responseSaveVoluntary) {
                                                            
                                                        });*/
                                                    } else {
                                                        alert("Te encuentras muy lejos para unirte a este simulacro.");
                                                    }
                                                    //console.log(geolocation.distance(loc, loc2));
                                                } else {
                                                    alert("Ya no es posible unirte al simulacro.");
                                                }
                                            });
                                        });
                                    });
                                } else {
                                    alert("Debe de ingresar el folio.");
                                }
                            }
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


}

exports.delete = function (args) {
    var item = args.view.bindingContext;
    var index = sismoGroupList.indexOf(item);
    //console.log("item--->" + item);
    //console.dir(item);
    //console.log("index--->" + index);
    sismoGroupList.delete(item.id).then(function (data) {
        //console.dir(data);
        if (data.response.simulacro.status) {
            loadList();
        } else {
            alert("No es posible eliminarlo");
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

function definirSimulacroVoluntario(b) {

    localNotifications.schedule([{
        id: 10000000000000000 + b.getTime(),
        title: "\u00BFEst\u00e1s listo para el simulacro?",
        body: "Iniciar\u00e1 dentro de 1 minuto.",
        ticker: "Aviso de sumulacro.",
        sound: require("application").ios ? "customsound-ios.wav" : "customsound-android",
        ongoing: true,
        badge: 1,
        //groupSummary: b.getTime(),
        at: new Date(b.getTime() - (60 * 1000))
    }]).then(function () {
        //appSettings.setBoolean("notification", true);
    }),
        function (error) {
            console.log("scheduling error: " + error);
        };

    /*var newDate = new Date();
    if (b.getHours + ":" + b.getMinutes === newDate.getHours + ":" + newDate.getMinutes) {
        refreshIntervalId = setInterval(playMusic, 500);
    }
    refreshIntervalDate = setInterval("test('" + newDate.getMilliseconds() + "')", 1000);*/
}


exports.listViewItemTap = function (args) {
    var item = args.view.bindingContext;
    var index = pageData.sismoGroupList.indexOf(item);
    console.dir(item);
    var dateSimulacrum = toDate(item.hora, "h:m");
    console.log(dateSimulacrum);
    if ((dateSimulacrum.getTime() - new Date().getTime()) > 0) {
        var navigationEntryArt = {
            moduleName: "view/simulacrum-join/simulacrum-join",
            backstackVisible: false,
            animated: true,
            context: {
                date: (dateSimulacrum.getTime() + 10000000000000000)
            },
            transition: {
                name: "slideLeft",
                duration: 380,
                curve: "easeIn"
            }
        };
        frameModule.topmost().navigate(navigationEntryArt);
    } else {
        alert("Ya no esta disponible el simulacro");
    }

}

