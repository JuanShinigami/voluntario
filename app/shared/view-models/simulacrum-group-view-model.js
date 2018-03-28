var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var toast;
var url = "";

function SismoGroupViewModel(items) {
    var viewModel = new ObservableArray(items);
    url = appSettings.getString("url");
    viewModel.addSimulacrumGroup = function (datos) {
        //console.dir(datos);
        return fetch(config.apiUrl + "simulacrumGroup/addSimulacrumGroup", {
            method: "POST",
            body: JSON.stringify({
                tagGrupal: datos["tagGrupal"],
                ubicacion: datos["ubicacion"],
                latitud: datos["latitud"],
                longitud: datos["longitud"],
                fecha: datos["fecha"],
                hora: datos["hora"],
                idVoluntarioCreador: datos["idVoluntarioCreador"],
                tiempoPreparacion: datos['tiempoPreparacion'],
                //tipoSimulacro: datos['tipoSimulacro'],
                estatus: "Creada",
                token: appSettings.getString("tokenUser")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(handleErrors)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.dir(data);
                return data;
            });
    };

    viewModel.load = function (idClient) {
        console.log(idClient);
        console.log(appSettings.getString("tokenUser"));
        return fetch(config.apiUrl + "simulacrumGroup/searchSimulacrumDetail", {
            method: "POST",
            body: JSON.stringify({
                idVoluntarioCreador: idClient,
                token: appSettings.getString("tokenUser")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(handleErrors)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                return data;
            });
        
    };

    viewModel.countVoluntary = function (idSimulacrum) {
        return fetch(config.apiUrl + "simulacrumGroup/countVoluntary", {
            method: "POST",
            body: JSON.stringify({
                idSimulacro: idSimulacrum,
                token: appSettings.getString("tokenUser")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(handleErrors)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                return data;
            });

    };


    viewModel.searchByFolio = function (folio) {
        return fetch(config.apiUrl + "simulacrumGroup/searchSimulacrumFolio", {
            method: "POST",
            body: JSON.stringify({
                folioSimulacro: folio,
                token: appSettings.getString("tokenUser")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(handleErrors)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data;
        });
    };


    viewModel.delete = function (idSimulacrum) {
        return fetch(config.apiUrl + "voluntarySimulacrum/deletelistVoluntary", {
            method: "POST",
            body: JSON.stringify({
                idSimulacro: idSimulacrum,
                token: appSettings.getString("tokenUser")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(handleErrors)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                return data;
            });

    };

    viewModel.updateStatusSimulacrumGroup = function (idSimulacrum) {
        return fetch(config.apiUrl + "simulacrumGroup/updateSimulacrumGroup", {
            method: "POST",
            body: JSON.stringify({
                id: idSimulacrum,
                estatus: 'Completada',
                token: appSettings.getString("tokenUser")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(handleErrors)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data;
        });
    };

    viewModel.empty = function() {
        while (viewModel.length) {
           viewModel.pop();
        }
    };

    return viewModel;
}

function handleErrors(response) {
    if (!response.ok) {
        viewToast(response.statusText);
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

module.exports = SismoGroupViewModel;