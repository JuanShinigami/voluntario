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
var alarm;
var toast;
var segundosDif = 0;
var minutes;
var seconds;
var refreshIntervalId;
var timerExecuteLoad;
var idSimulacrum;
var idVoluntarySimulacrum;
var time;

var pageData = new observableModule.fromObject({
    cronometro1: "00:00:00",
    cronometro: "00:00:00",
    evacuate: false,
    end: false,
    classButtonSuccess: "button-success-disabled",
    classButtonInfo: "button-info-disabled",
    countVoluntary: 1,
    isLoading: true,
    countVoluntaryVisible: false
});

exports.loaded = function (args) {
    alarm = sound.create("~/sounds/alarm2.mp3");
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = pageData;
    var requestData = page.navigationContext;
    console.dir(requestData);
    idSimulacrum = 0;
    //validate(requestData);
    load(requestData);
}

exports.onUnloaded = function () {
    clearTimeout(time);
    viewToast("Debes de volver antes de que inicie el simulacro.");
    console.log("Vuelve");
}

function load(data) {
    //console
    var ms = data.data.dateTime - new Date().getTime();
    idVoluntarySimulacrum = data.data.idVoluntarySimulacrum;
    if (ms > 0) {
        console.log("Milisegundos --> " + ms);
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
        time = setTimeout(startSound, ms);


    } else {
        navigateTopmost("view/home/home-page", false, true);
        viewToast("Lamentablemente te perdiste del simulacro.");
    }

    

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
        refreshIntervalId = setInterval(playMusic, 500);
        pageData.classButtonSuccess = "button-success";
    }
}

function startSound() {
    clearInterval(timerExecuteLoad);
    pageData.set("isLoading", false);
    pageData.classButtonSuccess = "button-success";
    pageData.evacuate = true;
    refreshIntervalId = setInterval(playMusic, 500);
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
    clearInterval(refreshIntervalId);
    alarm.stop();
    pageData.end = false;
    var datos = new Array();
    datos['idVoluntarioSimulacro'] = idVoluntarySimulacrum;
    datos['tiempoEstoyListo'] = pageData.get("cronometro1");
    datos['tiempoInicio'] = pageData.get("cronometro1");

    viewToast("TIEMPO EN SALIR----> " + pageData.get("cronometro1"));
    pageData.cronometro1 = "00:00:00";
    clearInterval(elcrono1);
    clearInterval(timerExecuteLoad);
    pageData.classButtonInfo = "button-info-disabled";

    simulacrumVoluntrayList.updateVoluntarySimulacrum(datos).then(function (data) {
        navigateTopmost("view/home/home-page", false, true);
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