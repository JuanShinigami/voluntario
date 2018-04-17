var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var sound = require("nativescript-sound");
var Toast = require("nativescript-toast");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var SimulacrumVoluntaryViewModel = require("../../shared/view-models/simulacrum-voluntary-view-model");
var sismoGroupList = new SismoGroupViewModel([]);
var simulacrumVoluntrayList = new SimulacrumVoluntaryViewModel([]);


var page;
var topmost;
var navigationOptions;

var marcha = 0;
var cro = 0;
var textCro = "";

var marcha1 = 0;
var cro1 = 0;
var textCro1 = "";
var dateIni;
var hourIni;
var toast;
var segundosDif = 0;
var minutes;
var seconds;
//var refreshIntervalId;
var timerExecuteLoad;
var idSimulacrum;
var idVoluntarySimulacrum;
var time;

var pageData = new observableModule.fromObject({
    cronometro1: "00:00:00",
    cronometro: "00:00:00",
    evacuate: true,
    end: false,
    classButtonSuccess: "button-success",
    classButtonInfo: "button-info-disabled",
    countVoluntary: 1,
    isLoading: true,
    countVoluntaryVisible: false
});

exports.loaded = function (args) {
    pageData.classButtonSuccess = "button-success";
    pageData.evacuate = true;
    //alarm = sound.create("~/sounds/alarm2.mp3");
    topmost = frameModule.topmost();
    
    page = args.object;
    page.bindingContext = pageData;
    var requestData = page.navigationContext;
    //console.log("CUANDO CARGO LA VISTA DE SIMULACRO GRUPO");
    //console.dir(requestData);
    idVoluntarySimulacrum = requestData.idSG;
    idSimulacrum = 0;
    /*simulacrumVoluntrayList.searchDateAndHour(requestData.idSG).then(function (data) {
        console.dir(data);
        if (data.response.StatusToken.status) {
            var b = toDate(data.response[0].hora, "h:m");
            var res = data.response[0].fecha.split("-");
            b.setFullYear(parseInt(res[2]));
            b.setMonth(parseInt(res[1] - 1));
            b.setDate(parseInt(res[0]));
            // if (b.getTime() < new Date().getTime()) {
            //     console.log("YA PASO");
            // } else {
            var timeMS = ((b.getTime()) - (new Date().getTime()));
            setTimeout(enabledButton, timeMS);
            // }
        } else {
            expireToken();
        }

    }).catch(function (error) {
        console.log("No es posible realizar la petición. " + error);
    });*/
    //validate(requestData);
    //load(requestData);
}

exports.onUnloaded = function () {
    //viewToast("N.");
}

function load(data) {



    //console
    var ms = data.data.dateTime - new Date().getTime();
    idVoluntarySimulacrum = data.data.idVoluntarySimulacrum;
    //if (ms > 0) {
        //console.log("Milisegundos --> " + ms);
        switch (data.data.typeVoluntary) {
            case 'create':
                pageData.countVoluntaryVisible = true;
                idSimulacrum = data.data.idSimulacrum;
                timerExecuteLoad = setInterval(searchCountVoluntary, 1000);
                break;
            case 'join':
                pageData.countVoluntaryVisible = false;
                break;
            default:
                pageData.countVoluntaryVisible = false;
        } 
        //console.log("Segundos --> " + (parseInt(ms / 1000)));
        //time = setTimeout(startSound, ms);


    //}
    /*else {
        navigateTopmost("view/home/home-page", false, true);
        viewToast("Lamentablemente te perdiste del simulacro.");
    }*/

    

}

function validate(dateTime) {
    if (dateTime.create) {
        pageData.countVoluntaryVisible = true;
        if (dateTime.currentCreate) {
            idSimulacrum = dateTime.idSimulacrum;
            timerExecuteLoad = setInterval(searchCountVoluntary, 1000);
        } else {
            idSimulacrum = dateTime.dataSimulacrum.idSimulacro;
            timerExecuteLoad = setInterval(searchCountVoluntary, 1000);
        }
    } else {
        pageData.countVoluntaryVisible = false;
        console.log("Me uni");
    }

    var date = new Date(dateTime.date - 10000000000000000);
    emp = new Date();
    elcrono = setInterval(tiempo, 10);
    var diasDif = date.getTime() - emp.getTime();
    var seg = Math.round(diasDif / (1000));
    minutes = Math.floor(seg / 60);
    seconds = seg % 60;
    console.log("Minutis ----> " + minutes);
    console.log("Second-----> " + seconds);
    if (seconds <= 0) {
        navigateTopmost("view/home/home-page", false, true);
        viewToast("Lamentablemente te perdiste del simulacro.");
    }

}

function searchCountVoluntary() {
    sismoGroupList.countVoluntary(idSimulacrum).then(function (responseData) {
        pageData.countVoluntary = responseData.response[0].totalVoluntario;
    });
}

function tiempo() {
    actual = new Date();
    cro = actual - emp;
    cr = new Date();
    cr.setTime(cro);
    cs = cr.getMilliseconds();
    cs = cs / 10;
    cs = Math.round(cs);
    sg = cr.getSeconds();
    mn = cr.getMinutes();
    if (mn === minutes && seconds === sg && cs === 0) {
        startSound();
        //refreshIntervalId = setInterval(playMusic, 500);
        pageData.classButtonSuccess = "button-success";
    }
}

function enabledButton() {
    pageData.classButtonSuccess = "button-success";
    pageData.evacuate = true;
}

function startSound() {
    clearInterval(timerExecuteLoad);
    pageData.set("isLoading", false);
    pageData.classButtonSuccess = "button-success";
    pageData.evacuate = true;
    //refreshIntervalId = setInterval(playMusic, 500);
    if (idSimulacrum != 0) {
        var datos = new Array();
        datos['idSimulacum'] = idSimulacrum;
        sismoGroupList.updateStatusSimulacrumGroup(datos).then(function (data) {
            if (data.response.status) {
                console.log("LO actualice a completado");
            }
        }).catch(function (error) {
            viewToast("Algo va mal con la conexion al servidor.");
            return Promise.reject();
        });
    }
    
}

function empezar() {
    if (marcha == 0) {
        emp1 = new Date();
        elcrono1 = setInterval(tiempoStart, 10);
        marcha = 1;
    }
}
function tiempoStart() {
    actual1 = new Date();
    cro1 = actual1 - emp1;
    cr1 = new Date();
    cr1.setTime(cro1);
    cs1 = cr1.getMilliseconds();
    cs1 = cs1 / 10;
    cs1 = Math.round(cs1);
    sg1 = cr1.getSeconds();
    mn1 = cr1.getMinutes();
    ho1 = cr1.getHours() - 1;
    if (cs1 < 10) { cs1 = "0" + cs1; }
    if (sg1 < 10) { sg1 = "0" + sg1; }
    if (mn1 < 10) { mn1 = "0" + mn1; }
    textCro = mn1 + ":" + sg1 + ":" + cs1;
    pageData.set("cronometro1", textCro);
}


function playMusic() {
    alarm.play();
}

exports.evacuate = function () {
    pageData.classButtonSuccess = "button-success-disabled";
    pageData.classButtonInfo = "button-info";
    empezar();
    pageData.evacuate = false;
    pageData.end = true;
}

exports.stop = function () {
    //clearInterval(refreshIntervalId);
    //alarm.stop();
    pageData.end = false;
    
    var timeOne = "00:" + mn1 + ":" + sg1;

    //viewToast("Bien hecho. Gracias por participar.");
    pageData.cronometro1 = "00:00:00";
    clearInterval(elcrono1);
    clearInterval(loopSound);
    clearInterval(playSoundCreate);
    //clearInterval(notificationCreate);
    clearInterval(changeActivity);
    pageData.classButtonInfo = "button-info-disabled";

    /*dialogsModule.prompt({
        title: "Informaci\u00F3n",
        message: "Gracias por participar. Puedes agregar un nombre al simulacro",
        okButtonText: "Aceptar"
    }).then(function (r) {
        if (r.result) {
            datos
        } else {

        }

    });*/

    
    /*var tagVoluntario = "";;
    dialogsModule.confirm({
        title: "Informaci\u00F3n",
        message: "Gracias por participar. ¿Deseas agregar un nombre al simulacro?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        //console.log("Dialog result: " + result);
        if (result) {
            dialogsModule.prompt({
                title: "Informaci\u00F3n",
                message: "Agrega un nombre.",
                okButtonText: "Aceptar"
            }).then(function (r) {
                if (r.result) {
                    tagVoluntario = r.text;
                }

            });
        }
    });*/
    var tagVoluntario = "";
    var datos = new Array();
    datos['idVoluntarioSimulacro'] = idVoluntarySimulacrum;
    datos['tiempoEstoyListo'] = timeOne;
    datos['tiempoInicio'] = timeOne;
    datos['tagVoluntario'] = tagVoluntario;

    simulacrumVoluntrayList.updateVoluntarySimulacrum(datos).then(function (data) {
        if (data.response.StatusToken.status) {
            viewToast("Gracias por participar.");
            navigateTopmost("view/home/home-page", false, true);
        } else {
            expireToken();
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

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

exports.back = function () {
    var topmost = frameModule.topmost();
    var navigationOptions = {
        moduleName: "view/home/home-page",
        backstackVisible: false,
        clearHistory: true,
        animated: true,
        transition: {
            name: "slideLeft",
            duration: 380,
            curve: "easeIn"
        }
    };
    topmost.navigate(navigationOptions);
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