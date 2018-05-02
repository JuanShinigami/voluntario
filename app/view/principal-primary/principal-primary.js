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
    
});


exports.loaded = function (args) {
    topmost = frameModule.topmost();

    localNotifications.addOnMessageReceivedCallback(function (notification) {
        idVoluntarySimulacrum = notification.id;
        //alert("Que trae notificacion en LOG ----> " + notification.id);
        //consolePlay = setTimeout(UnitTestNotification, 1000);
        //alert("Que traes ---> " + (typeof playSoundCreate));
        if (typeof playSoundCreate == "undefined") {
            //alert("EXISTE EL COMANDO SONAR");
            //viewToast("Voy a realizar la peticion");
            simulacrumVoluntrayList.searchDateAndHour(notification.id).then(function (data) {
                console.dir(data);

                //alert(" Ya la hice ----> " + JSON.stringify(data));
                if (data.response.StatusToken.status) {
                    //console.log("ENTO PORQUE AOY TRUE")
                    var b = toDate(data.response.fechaHoraSimulacro[0].hora, "h:m");
                    var res = data.response.fechaHoraSimulacro[0].fecha.split("-");
                    //console.log("FECHA ANTES DE AGREGAR LA FECHA -----> " + b.toString());
                    b.setFullYear(parseInt(res[0]));
                    b.setMonth(parseInt(res[1]) - 1);
                    b.setDate(parseInt(res[2]));
                    //console.log("FECHA AND HORA ----------> " + b.toString());
                    var msR = (b.getTime()) - (new Date().getTime());
                    //console.log("LO QUE FALTA    ----- > " + msR);
                    if (msR >= 1000) {

                        //viewToast("TIEMPO EN EL QUE LA PROGRAME ----> " + (msR/ 1000) + " segundos iniciara.");
                        var seg = (msR / 1000);
                        //viewToast("En " + seg + "segundos iniciará el simulacro.");
                        //console.log("Entre a programarla");
                        playSoundCreate = setTimeout(programerSound, (b.getTime()) - (new Date().getTime()));
                        changeActivity = setTimeout(navigateActivitySimulacrumJoin, ((b.getTime() + 1000) - (new Date().getTime())));
                        //alert("Hoola --->" + seg);
                        dialogsModule.alert({
                            message: "El simulacro iniciará en " + parseInt(seg) + " segundos.",
                            okButtonText: "Aceptar"
                        });
                    } else {
                        dialogsModule.alert({
                            message: "Lo sentimos ya no puedes participar en el simulacro.",
                            okButtonText: "Aceptar"
                        });
                    }
                } else {
                    expireToken();
                }
            }).catch(function (error) {
                console.log("No es posible realizar la petición. " + error);
            });

        } else {
            //alert("No existo")
            //viewToast("Voy hacer la peticion");
            simulacrumVoluntrayList.searchDateAndHour(notification.id).then(function (data) {
                if (data.response.StatusToken.status) {
                    //console.log("ENTO PORQUE AOY TRUE")
                    var b = toDate(data.response.fechaHoraSimulacro[0].hora, "h:m");
                    var res = data.response.fechaHoraSimulacro[0].fecha.split("-");
                    //console.log("FECHA ANTES DE AGREGAR LA FECHA -----> " + b.toString());
                    b.setFullYear(parseInt(res[0]));
                    b.setMonth(parseInt(res[1]) - 1);
                    b.setDate(parseInt(res[2]));

                    var msR = (b.getTime()) - (new Date().getTime());
                    //console.log("LO QUE FALTA    ----- > " + msR);
                    //if (msR >= 1000) {

                    //viewToast("TIEMPO EN EL QUE LA PROGRAME ----> " + (msR/ 1000) + " segundos iniciara.");
                    var seg = (msR / 1000);
                    //viewToast("En " + seg + "segundos iniciará el simulacro.");
                    // console.log("Entre a programarla");
                    //playSoundCreate = setTimeout(programerSound, (b.getTime()) - (new Date().getTime()));
                    //changeActivity = setTimeout(navigateActivitySimulacrumJoin, ((b.getTime() + 1000) - (new Date().getTime())));
                    //alert("Hoola --->" + seg);
                    if (seg > 0) {
                        dialogsModule.alert({
                            message: "El simulacro iniciará en " + parseInt(seg) + " segundos.",
                            okButtonText: "Aceptar"
                        });
                    } else {
                        dialogsModule.alert({
                            message: "Lo sentimos ya no puedes participar en el simulacro.",
                            okButtonText: "Aceptar"
                        });
                    }

                }

            }).catch(function (error) {
                console.log("No es posible realizar la petición. " + error);
            });
            console.log("EXISTE EL COMANDO SONAR");
        }
        //console.log(notificationCreate);
        //console.log("Que trae notificacion en DIR");
        //console.dir(notificationCreate);
        /*var navigationEntryArt = {
            moduleName: "view/simulacrum-join/simulacrum-join",
            backstackVisible: false,
            animated: false,
            context: {
                idSG: notification.id
            },
            
        };
        frameModule.topmost().navigate(navigationEntryArt);
        }*/
    }).then(function () {
        //console.log("Listener added");
    });


    page = args.object;
    page.bindingContext = pageData;
}

exports.group = function () {
    navigateTopmost("view/principal-secondary/principal-secondary", false, false);
}

exports.individual = function () {
    navigateTopmost("view/home-simulacrum/home-simulacrum",false,false);
    /*var navigationEntryArtJoin = {
        moduleName: "view/simulacrum-join/simulacrum-join",
        backstackVisible: false,
        animated: true,
        context: {
            idSG: null,
        },
        transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }
    };
    frameModule.topmost().navigate(navigationEntryArtJoin);*/
}

exports.logout = function () {
    console.log("CERAR SESION");
    userViewModel.logout().then(function (dataResponse) {
        console.dir(dataResponse);
        if (dataResponse.response.update.status) {
            appSettings.remove("login");
            //appSettings.remove("folioUser");
            appSettings.remove("emailUser");
            //appSettings.remove("phoneUser");
            appSettings.remove("nameUser");
            appSettings.remove("idUser");
            appSettings.remove("tokenUser");
            frameModule.topmost().navigate({
                moduleName: "view/login/login",
                transition: {
                    name: "fade"
                }
            });
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