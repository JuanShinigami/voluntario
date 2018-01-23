var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var sound = require("nativescript-sound");
var geolocation = require("nativescript-geolocation");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var SimulacrumVoluntaryViewModel = require("../../shared/view-models/simulacrum-voluntary-view-model");
var UserViewModel = require("../../shared/view-models/user-view-model");

var sismoGroupList = new SismoGroupViewModel([]);
var userViewModel = new UserViewModel([]);
var simulacrumVoluntaryViewModel = new SimulacrumVoluntaryViewModel([]);

var page;
var topmost;
var navigationOptions;
var alarm;
var refreshIntervalId;
var refreshIntervalDate;

var pageData = new observableModule.fromObject({
    titleBar: "",
    enabledCreate: null,
    sismoGroupList: sismoGroupList
});

exports.loaded = function (args) {
    pageData.titleBar = config.titleBarListSimulacrumGroup;
    pageData.enabledCreate = config.flag;
    topmost = frameModule.topmost();
    alarm = sound.create("~/sounds/alarm2.mp3");
    page = args.object;
    page.bindingContext = pageData;
    loadList();
}

function loadList() {
    pageData.set("isLoading", true);
    var listView = page.getViewById("sismoGroupList");
    sismoGroupList.load(10).then(function (data) {
        //console.dir(data);
        pageData.sismoGroupList = data.response;
        pageData.set("isLoading", false);
        listView.animate({
            opacity: 1,
            duration: 1000
        });
    });
}

exports.back = function () {
    navigateTopmost("view/home/home-page", true, false); 
}

exports.onCreateSimulacrumGroup = function () {
    navigateTopmost("view/add-simulacrum-group/add-simulacrum-group", true, false);
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

    // Navegamos a la vista indicada
    topmost.navigate(navigationOptions);

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
                                                        config.dateSimulacrum = b;
                                                        console.log("HORA --> " + b.getHours() + "Minutos --> " + b.getMinutes());
                                                        definirSimulacroVoluntario(b);
                                                        /*simulacrumVoluntaryViewModel.addVoluntary(datos).then(function (responseSaveVoluntary) {
                                                            
                                                        });*/
                                                    } else {
                                                        alert("Te encuentras muy lejos para unirte a este simulacro.");
                                                    }
                                                    //console.log(geolocation.distance(loc, loc2));
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
    console.log("item--->" + item);
    console.dir(item);
    console.log("index--->" + index);
    sismoGroupList.delete(item.id).then(function (data) {
        console.dir(data);
        loadList();
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

function playMusic() {
    alarm.play();
}

function definirSimulacroVoluntario(b) {
    var newDate = new Date();
    /*if (b.getHours + ":" + b.getMinutes === newDate.getHours + ":" + newDate.getMinutes) {
        refreshIntervalId = setInterval(playMusic, 500);
    }*/
    refreshIntervalDate = setInterval("test('" + newDate.getMilliseconds() + "')", 1000);
    
}

function test(time) {
    console.log(time);
}