var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var sound = require("nativescript-sound");
var appSettings = require("application-settings");
//var Sqlite = require("nativescript-sqlite");
var dialogs = require("ui/dialogs");
var frameModule = require("ui/frame");
var Toast = require("nativescript-toast");
var alarmList = new ObservableArray();

var page;
//variables de inicio:
var marcha = 0; //control del temporizador
var cro = 0; //estado inicial del cronómetro.
var textCro = "";

var marcha1 = 0; //control del temporizador
var cro1 = 0; //estado inicial del cronómetro.
var textCro1 = "";

var dateIni;
var hourIni;

var cont = 0;
var alarm;
var toast;

var refreshIntervalId;


var pageData = new observableModule.fromObject({
    cronometro1: "00:00:00",
    cronometro: "00:00:00",
    initial: true,
    evacuate: false,
    end: false
});

exports.loaded = function (args) {
    alarm = sound.create("~/sounds/alarm2.mp3");
    
    
    page = args.object;
    page.bindingContext = pageData;
    
}

exports.start = function () {
    
    
    viewToast("En unos momentos se iniciará el simulacro. ¡Debe estar atento!.");
    pageData.initial = false;
    
    var x = Math.floor((Math.random() * 40) + 1);
    setTimeout(myFunction, (1000 * x));
}

function playMusic() {
    alarm.play();
}

function myFunction() {
    refreshIntervalId = setInterval(playMusic, 500);
    pageData.evacuate = true;
    var dateInit = new Date();
    dateIni = "Fecha : " + dateInit.getDay() + "/" + dateInit.getMonth() + "/" + dateInit.getFullYear();
    hourIni = "Hora : " + dateInit.getHours() + ":" + dateInit.getMinutes() + ":" + dateInit.getSeconds();
    empezar();
    
}

//cronometro en marcha. Empezar en 0:
function empezar() {

    if (marcha == 0) { //solo si el cronómetro esta parado
        emp = new Date(); //fecha actual
        elcrono = setInterval(tiempo, 10); //función del temporizador.
        marcha = 1; //indicamos que se ha puesto en marcha.
    }
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
    ho = cr.getHours() - 1; //horas del cronómetro
    
    
    if (cs < 10) { cs = "0" + cs; }  //poner siempre 2 cifras en los números
    if (sg < 10) { sg = "0" + sg; }
    if (mn < 10) { mn = "0" + mn; }
    textCro = mn + ":" + sg + ":" + cs;
    //console.log(sg);
    
}

//cronometro en marcha. Empezar en 0:
function empezar1() {
    if (marcha1 == 0) { //solo si el cronómetro esta parado
        emp1 = new Date(); //fecha actual
        elcrono1 = setInterval(tiempo1, 10); //función del temporizador.
        marcha1 = 1; //indicamos que se ha puesto en marcha.
    }
}
function tiempo1() { //función del temporizador
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
    textCro1 = mn1 + ":" + sg1 + ":" + cs1;
    pageData.set("cronometro1", textCro1);
}

exports.evacuate = function () {
    pageData.evacuate = false;
    pageData.end = true;
    empezar1();
}

exports.stop = function () {
    console.log("PARE LA ALARMA");
    
    parar();
}

function parar() {
    pageData.initial = true;
    pageData.end = false;
    if (marcha == 1 && marcha1 == 1) { //sólo si está en funcionamiento
        clearInterval(elcrono); //parar el crono
        clearInterval(elcrono1);
        marcha = 0; //indicar que está parado.
        marcha1 = 0;
        var dateEnd = new Date();
        cont++;
        alarmList.push({identify : cont, time: dateIni , date: hourIni, duration: "Tiempo : " + textCro1 });
        pageData.set("alarmList", alarmList);
        
        pageData.cronometro1 = "00:00:00";
        
        alarm.stop();
        clearInterval(refreshIntervalId);
        
    } else {
        clearInterval(elcrono);
        marcha = 0;
        
    }
    
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

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}