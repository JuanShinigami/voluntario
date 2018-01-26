var dialogsModule = require("ui/dialogs");
var config = require("../../shared/config");
var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var sound = require("nativescript-sound");
var Toast = require("nativescript-toast");



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
var refreshIntervalId;

var pageData = new observableModule.fromObject({
    cronometro1: "00:00:00",
    cronometro: "00:00:00",
    initial: true,
    evacuate: false,
    end: false,
    classButtonPrimary: "button-primary",
    classButtonSuccess: "button-success-disabled",
    classButtonInfo: "button-info-disabled"
});

exports.loaded = function (args) {
    alarm = sound.create("~/sounds/alarm2.mp3");
    page = args.object;
    page.bindingContext = pageData;
    var requestData = page.navigationContext;
    validate(requestData.date);
}

function validate(date) {
    console.log(date);
    emp = new Date(); //fecha actual
    elcrono = setInterval(tiempo, 10); //función del temporizador.
    var diasDif = date.getTime() - emp.getTime();
    var dias = Math.round(diasDif / (1000));
    console.log("Segundos -- >" + (dias * -1));
    segundosDif = (dias * -1);

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
    if (segundosDif == sg && cs == 0) {
        console.log("Es hora de tocar ----> " + mn + ":" + sg + ":" + cs);
        refreshIntervalId = setInterval(playMusic, 500);
    }
    //console.log(mn + ":" + sg + ":" + cs);
    //console.log(sg);

}

function playMusic() {
    alarm.play();
}