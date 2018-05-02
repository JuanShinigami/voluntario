const application = require("application");
var frameModule = require("ui/frame");
var htmlViewModule = require("ui/html-view");
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
var htmlView = new htmlViewModule.HtmlView();

var pageData = new observableModule.fromObject({
    enabledCreate: null,
    simulacrumGroupList: simulacrumVoluntrayList,
    listCreate: false,
});


exports.onNavigatingTo = function (args) {
    topmost = frameModule.topmost();
    alarm = sound.create("~/sounds/alarm2.mp3");
    page = args.object;
    page.bindingContext = pageData;
    loadListCreator();
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
    //console.log("ENTRE A CARGAR LA LISTA CREATE");
    pageData.set("isLoading", true);
    var listView = page.getViewById("simulacrumGroupList");
    sismoGroupList.load(appSettings.getNumber("idUser")).then(function (dataResponse) {
        //console.log("ERROR ROROROROROROROOR");
        //console.dir(dataResponse);
        //console.log("ESTATUS TRAE -----> " + dataResponse.response.StatusToken.status);
        //console.log((data.response.token.status === undefined));
        //var flag = (data.response.token.status == "undefined") ? false : true;
        //console.log("FLAG ---> " + flag);
        if (dataResponse.response.StatusToken.status != false) {

            if (dataResponse.response.detalle.length <= 0) {
                pageData.listCreate = true;
            } else {
                pageData.simulacrumGroupList = dataResponse.response.detalle;
            }
            pageData.set("isLoading", false);
            listView.animate({
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
            message: "No pude procesar la peticiónm.",
            okButtonText: "Aceptar"
        });
        return Promise.reject();
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

exports.onCreateSimulacrumGroup = function () {
    //console.log("ENTRE AQUI IOS");
    navigateTopmost("view/add-simulacrum-group/add-simulacrum-group", false, false);
}


exports.cancel = function (args) {
    var item = args.view.bindingContext;
    console.dir(item);
    var index = sismoGroupList.indexOf(item);
    dialogsModule.confirm({
        title: "Aviso",
        message: "\u00BFEstás seguro que deseas salir del simulacro " + item.tagGrupal + "?",
        okButtonText: "Si",
        cancelButtonText: "No",
    }).then(function (result) {
        if (result) {
            var datos = new Array();
            datos['idVoluntario'] = item.idVoluntario;
            datos['idSimulacro'] = item.idSimulacro;
            simulacrumVoluntrayList.deleteVoluntary(datos).then(function (responseData) {
                //console.dir(responseData.response.respuesta.status);
                console.dir(responseData);

                if (responseData.response.StatusToken.status) {
                    if (responseData.response.respuesta.status) {
                        loadListCreator();
                        loadListJoin();
                    } else {
                        dialogsModule.alert({
                            message: "No es posible cancelar el simulacro.",
                            okButtonText: "Aceptar"
                        });
                        //alert("No es posible cancelar el simulacro.");
                    }
                } else {
                    expireToken();
                }
                /*if (responseData.response.respuesta.status) {
                    
                } else {
                    dialogsModule.alert({
                        message: "No es posible cancelar el simulacro.",
                        okButtonText: "Aceptar"
                    });
                    //alert("No es posible cancelar el simulacro.");
                }*/
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
    dialogsModule.action({
        cancelButtonText: "Cancelar",
        actions: [" * Ver folio", " * Compartir folio", " * Cantidad de voluntarios", "* Ver resultados"]
    }).then(function (result) {
        //console.log("Dialog result: " + result);
        switch (result) {
            case " * Ver folio":
                dialogsModule.alert({
                    message: "Folio: " + item.folioSimulacro + ".",
                    okButtonText: "Aceptar"
                });
                break;
            case " * Compartir folio":
                console.log("compartir");
                SocialShare.shareText("Los invito a mí simulacro con la aplicación Voluntario.\nÚnete con el folio: " + item.folioSimulacro + ".", "¿Con quién deseas compartir el folio del simulacro? ");
                break;
            case " * Cantidad de voluntarios":
                console.log("Ve");
                sismoGroupList.countVoluntary(item.id).then(function (dataResponse) {
                    console.dir(dataResponse);
                    //console.log(" kalskd--->> " + parseInt(dataResponse.response[0].totalVoluntario));
                    //alert("Cantidad de Voluntarios: " + parseInt(dataResponse.response[0].totalVoluntario));
                    viewToast("Cantidad de Voluntarios: " + parseInt(dataResponse.response[0].totalVoluntario));
                    /*if (dataResponse.response.StatusToken.status) {
                        
                    } else {
                        expireToken();
                    }*/
                }).catch(function (error) {
                    console.log(error);
                });
                break;
            case "* Ver resultados":

                break;
            default:
                console.log("No existe esta opcion");
        }
    });
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

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
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
    navigateTopmost("view/principal-secondary/principal-secondary", false, false);
}