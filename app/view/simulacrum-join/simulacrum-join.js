var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var sound = require("nativescript-sound");
var Toast = require("nativescript-toast");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var sismoGroupList = new SismoGroupViewModel([]);


var page;
var topmost;
var navigationOptions;

//variables de inicio:
var marcha = 0; //control del temporizador
var cro = 0; //estado inicial del cronómetro.
var textCro = "";

var marcha1 = 0; //control del temporizador
var cro1 = 0; //estado inicial del cronómetro.
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

var pageData = new observableModule.fromObject({
    cronometro1: "00:00:00",
    cronometro: "00:00:00",
    evacuate: false,
    end: false,
    classButtonSuccess: "button-success-disabled",
    classButtonInfo: "button-info-disabled",
    countVoluntary: 0,
    isLoading: true,
    countVoluntaryVisible: false
});

exports.loaded = function (args) {
    alarm = sound.create("~/sounds/alarm2.mp3");
    topmost = frameModule.topmost();
    page = args.object;
    page.bindingContext = pageData;
    var requestData = page.navigationContext;
    console.log(requestData);
    validate(requestData);
    
}

function validate(dateTime) {
    console.dir(dateTime);
    if (dateTime.create) {
        pageData.countVoluntaryVisible = true;
        if (dateTime.currentCreate) {
            idSimulacrum = dateTime.idSimulacrum;
            timerExecuteLoad = setInterval(searchCountVoluntary, 1000);
        } else {
            idSimulacrum = dateTime.dataSimulacrum.idSimulacro;
            timerExecuteLoad = setInterval(searchCountVoluntary, 1000);
            //console.log(idSimulacrum);
            //timerExecuteLoad = setInterval(searchCountVoluntary, 1000);
        }
        //idSimulacrum = dateTime.dataSimulacrum.idSimulacro;
        //console.log(idSimulacrum);
        //timerExecuteLoad = setInterval(searchCountVoluntary, 1000);
        //console.log("Lo creee");
    } else {
        pageData.countVoluntaryVisible = false;
        console.log("Me uni");
    }

    var date = new Date(dateTime.date - 10000000000000000);
    emp = new Date(); //fecha actual
    elcrono = setInterval(tiempo, 10); //función del temporizador.
    var diasDif = date.getTime() - emp.getTime();
    var seg = Math.round(diasDif / (1000));
    minutes = Math.floor(seg / 60);
    seconds = seg % 60;
    //console.log("Segundos -- >" + (dias));
    console.log("Minutis ----> " + minutes);
    console.log("Second-----> " + seconds);
    //segundosDif = dias;
    if (seconds <= 0) {
        navigateTopmost("view/home/home-page", false, true);
        viewToast("Lamentablemente te perdiste del simulacro.");
    }

}

function searchCountVoluntary() {
    sismoGroupList.countVoluntary(idSimulacrum).then(function (responseData) {
        pageData.countVoluntary = responseData.response[0].totalVoluntario;
        //console.log("Cantidad de voluntarios ---> " + responseData.response[0].totalVoluntario);
    });
}

function tiempo() { //función del temporizador
    actual = new Date(); //fecha en el instante
    cro = actual - emp; //tiempo transcurrido en milisegundos
    cr = new Date(); //fecha donde guardamos el tiempo transcurrido
    cr.setTime(cro);
    cs = cr.getMilliseconds(); //milisegundos del cronómetro
    cs = cs / 10; //paso a centésimas de segundo.
    cs = Math.round(cs);
    sg = cr.getSeconds(); //segundos del cronómetro
    mn = cr.getMinutes(); //minutos del cronómetro
    //ho = cr.getHours() - 1; //horas del cronómetro


    //if (cs < 10) { cs = "0" + cs; }  //poner siempre 2 cifras en los números
    //if (sg < 10) { sg = "0" + sg; }
    //if (mn < 10) { mn = "0" + mn; }
    //console.log(mn + ":" + sg + ":" + cs);
    if (mn === minutes && seconds === sg && cs === 0) {

        startSound();
        /*pageData.isLoading = false;
        console.log("Es hora de tocar ----> " + mn + ":" + sg + ":" + cs);
        refreshIntervalId = setInterval(playMusic, 500);
        pageData.classButtonSuccess = "button-success";*/
        //pageData.evacuate = true;
        
        

    }
    //console.log(mn + ":" + sg + ":" + cs);
    //console.log(sg);

}

function startSound() {
    //pageData.isLoading = false;
    //console.log("Es hora de tocar ----> " + mn + ":" + sg + ":" + cs);}
    pageData.set("isLoading", false);
    refreshIntervalId = setInterval(playMusic, 500);
    pageData.classButtonSuccess = "button-success";
    pageData.evacuate = true;
}

function empezar() {
    if (marcha == 0) { //solo si el cronómetro esta parado
        emp1 = new Date(); //fecha actual
        elcrono1 = setInterval(tiempoStart, 10); //función del temporizador.
        marcha = 1; //indicamos que se ha puesto en marcha.
    }
}
function tiempoStart() { //función del temporizador
    actual1 = new Date(); //fecha en el instante
    cro1 = actual1 - emp1; //tiempo transcurrido en milisegundos
    cr1 = new Date(); //fecha donde guardamos el tiempo transcurrido
    cr1.setTime(cro1);
    cs1 = cr1.getMilliseconds(); //milisegundos del cronómetro
    cs1 = cs1 / 10; //paso a centésimas de segundo.
    cs1 = Math.round(cs1);
    sg1 = cr1.getSeconds(); //segundos del cronómetro
    mn1 = cr1.getMinutes(); //minutos del cronómetro
    ho1 = cr1.getHours() - 1; //horas del cronómetro


    if (cs1 < 10) { cs1 = "0" + cs1; }  //poner siempre 2 cifras en los números
    if (sg1 < 10) { sg1 = "0" + sg1; }
    if (mn1 < 10) { mn1 = "0" + mn1; }
    textCro = mn1 + ":" + sg1 + ":" + cs1;
    pageData.set("cronometro1", textCro);
    //console.log(sg);

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
    alarm.stop();
    clearInterval(refreshIntervalId);
    pageData.end = false;
    viewToast("TIEMPO EN SALIR----> " + pageData.get("cronometro1"));
    pageData.cronometro1 = "00:00:00";
    clearInterval(elcrono1);
    clearInterval(timerExecuteLoad);
    pageData.classButtonInfo = "button-info-disabled";
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

    // Opciones de la navegacion
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

    // Navegamos a la vista indicada
    topmost.navigate(navigationOptions);
}