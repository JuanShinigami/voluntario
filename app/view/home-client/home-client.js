var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var frameModule = require("ui/frame");
var SismoGroupViewModel = require("../../shared/view-models/sismo-group-view-model");
var geolocation = require("nativescript-geolocation");
var config = require("../../shared/config");
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var dialogsModule = require("ui/dialogs");

var page;

var toast;
var sismoGroupList = new SismoGroupViewModel([]);
var pageData = new observableModule.fromObject({
    sismoGroupList: sismoGroupList
});

exports.loaded = function(args) {
    console.log("Entre aqui en la vista del cliente");
    page = args.object;

    page.bindingContext = pageData;

    
    var listView = page.getViewById("sismoGroupList");
    //pageData.set("isLoading", true);
    //sismoGroupList.empty();

    //-- Temporal --
    //sismoGroupList.load(1);
    //pageData.set("isLoading", true);
}

exports.onDrawerButtonTap = function(args){
	const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.onAddSimulacrum = function () {
    geolocation.isEnabled().then(function (isEnabled) {
        if (!isEnabled) {
            geolocation.enableLocationRequest().then(function () {
            }, function (e) {
                console.log("Error: " + (e.message || e));
            });
        } else {
            console.log("Esta permitido");

            var location = geolocation.getCurrentLocation({ desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000 }).
                then(function (loc) {
                    if (loc) {
                        //console.log("Current location is: " + loc);
                        //console.dir(loc);
                        /*sismoGroupList.searchDirections(loc.latitude, loc.longitude).catch(function (error) {
                            
                        })
                            .then(function (data) {
                                alert(JSON.stringify(data));
                            });*/

                        fetch(config.apiMapsDirection + loc.latitude + "," + loc.longitude + config.apiKeyGoogle, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }).then(handleErrors)
                            .then(function (response) {
                                return response.json();
                            })
                            .then(function (data) {

                                var completeDirection = JSON.stringify(data.results[0].formatted_address);
                                var idVoluntarioCreador = 1;
                                var date = new Date();
                                var dateFormart = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDay();
                                var timeFormart = (date.getHours() + 1) + ":" + (date.getMinutes() + 1) + ":" + (date.getSeconds() + 1);
                                console.log(completeDirection);
                                viewToast(completeDirection);
                                var strSimulacrumGroup = '{"ubicacion": "' + completeDirection + '", "latitud": "' + loc.latitude + '", "longitud": "' + loc.longitude + '", "fecha": "' + dateFormart + '", "hora": "' + timeFormart + '", "idVoluntarioCreador": "' + idVoluntarioCreador + '"}';
                                //console.log(strSimulacrumGroup);
                                var JSONsimulacrumGroup = JSON.parse(strSimulacrumGroup);
                                console.log("Hola ------------ aqui");

                                dialogsModule.alert({
                                    title: "Información",
                                    message: "Su simulacro se a creado satisfactoriamente.",
                                    okButtonText: "Aceptar"
                                }).then(function () {
                                    console.log("Ya lo cree");
                                });

                                // --- Si ya se persistio el simulacro grupo ---
                                dialogsModule.alert({
                                    title: "Información",
                                    message: "Tu simulacro se ha creado satisfactoriamente, ",
                                    okButtonText: "Aceptar"
                                }).then(function () {
                                    console.log("Fue Creado correctamente--------->");
                                });


                                sismoGroupList.addSimulacrumGroup(JSONsimulacrumGroup).then(function (data) {
                                    console.dir(data);
                                });
                                

                            });

                        
                        //console.log("DIRECCION DESDE EL CONTROLADOR -----> " + appSettings.getString("direction"));
                        //alert("Vives en " + appSettings.getString("direction"));
                        
                        
                    }
                }, function (e) {
                    console.log("Error: " + e.message);
                });
        }
    }, function (e) {
        console.log("Error: " + (e.message || e));
    });
}


function handleErrors(response) {
    //console.log("ERROR");
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}