var observableModule = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var frameModule = require("ui/frame");
var SismoGroupViewModel = require("../../shared/view-models/simulacrum-group-view-model");
var geolocation = require("nativescript-geolocation");
var config = require("../../shared/config");
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var dialogsModule = require("ui/dialogs");

var page;

var toast;
var sismoGroupList = new SismoGroupViewModel([]);
var pageData = new observableModule.fromObject({
    sismoGroupList: sismoGroupList,
    isLoading: false
});

exports.loaded = function(args) {
    console.log("Entre aqui en la vista del cliente");
    page = args.object;

    page.bindingContext = pageData;

    
    var listView = page.getViewById("sismoGroupList");
    //pageData.set("isLoading", true);
    //sismoGroupList.empty();

    //-- Temporal --
    sismoGroupList.load(parseInt(appSettings.getString("identificador"))).then(function (data) {
        //console.dir(data);
        console.dir(data.response[0]);
        pageData.set("sismoGroupList", data.response);
    });
    //pageData.set("isLoading", true);
}

exports.onDrawerButtonTap = function(args){
	const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.onAddSimulacrum = function () {
    pageData.set("isLoading", true);
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
                                var dateFormat = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
                                var timeFormat = date.getHours() + ":" + (date.getMinutes() + 1);
                                console.log("fecha : " + dateFormat);
                                console.log("tiempo : " + timeFormat)
                                console.log(completeDirection);
                                viewToast(completeDirection);
                                var strSimulacrumGroup = '{"ubicacion": ' + completeDirection + ', "latitud": "' + loc.latitude + '", "longitud": "' + loc.longitude + '", "fecha": "' + dateFormat + '", "hora": "' + timeFormat + '", "idVoluntarioCreador": "' + appSettings.getString("identificador") + '", "estatus": "creada", "token": "token"}';
                                var datos = new Array();
                                datos["ubicacion"] = completeDirection;
                                datos["latitud"] = loc.latitude;
                                datos["longitud"] = loc.longitude;
                                datos["fecha"] = dateFormat;
                                datos["hora"] = timeFormat;
                                datos["idVoluntarioCreador"] = appSettings.getString("identificador");
                                //console.log("Ubicacion de el Arreglo ----------> " + datos["ubicacion"]);
                                //console.log("Antes de convertirlo.");
                                //console.log(strSimulacrumGroup);
                                var JSONsimulacrumGroup = JSON.parse(strSimulacrumGroup);
                                //console.log("Hola ------------ aqui");

                                sismoGroupList.addSimulacrumGroup(datos).then(function (data) {
                                    pageData.set("isLoading", false);
                                    dialogsModule.alert({
                                        title: "Informaci\u00F3n",
                                        message: "Tu simulacro se ha creado satisfactoriamente.",
                                        okButtonText: "Aceptar"
                                    }).then(function () {

                                        var topmost = frameModule.topmost();

                                        // Opciones de la navegacion
                                        var navigationOptions = {
                                            moduleName: "view/simulacrum-detail/simulacrum-detail",
                                            backstackVisible: false,
                                            clearHistory: false,
                                            animated: true,
                                            transition: {
                                                name: "slideLeft",
                                                duration: 380,
                                                curve: "easeIn"
                                            }
                                        };

                                        // Navegamos a la vista indicada
                                        topmost.navigate(navigationOptions);
                                        console.log("Fue Creado correctamente--------->");
                                    });
                                });

                                // --- Si ya se persistio el simulacro grupo ---
                                // Esto es despues de que se ha persistido el simulacro grupo
                                /**pageData.set("isLoading", false);
                                dialogsModule.alert({
                                    title: "Informaci\u00F3n",
                                    message: "Tu simulacro se ha creado satisfactoriamente.",
                                    okButtonText: "Aceptar"
                                }).then(function () {
                                    
                                    var topmost = frameModule.topmost();

                                    // Opciones de la navegacion
                                    var navigationOptions = {
                                        moduleName: "view/simulacrum-detail/simulacrum-detail",
                                        backstackVisible: false,
                                        clearHistory: false,
                                        animated: true,
                                        transition: {
                                            name: "slideLeft",
                                            duration: 380,
                                            curve: "easeIn"
                                        }
                                    };
                                    
                                    // Navegamos a la vista indicada
                                    topmost.navigate(navigationOptions);
                                    console.log("Fue Creado correctamente--------->");
                                });*/

                                //sismoGroupList.addSimulacrumGroup(JSONsimulacrumGroup);

                                
                                

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

exports.listViewItemTap = function (args) {

    var item = args.view.bindingContext;
    // index: el valor seleccionado
    var index = pageData.sismoGroupList.indexOf(item);
    //alert("Seleccione 1 --->" + item.name);
    console.log("ITEM --->" + item.identify);
    console.log("INDEX --->" + index);



}