var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");

function SismoGroupViewModel(items) {
    var viewModel = new ObservableArray(items);
    viewModel.addSimulacrumGroup = function (datos) {
        return fetch(config.apiUrl + "simulacrumGroup/addSimulacrumGroup", {
            method: "POST",
            body: JSON.stringify({
                ubicacion: datos["ubicacion"],
                latitud: datos["latitud"],
                longitud: datos["longitud"],
                fecha: datos["fecha"],
                hora: datos["hora"],
                idVoluntarioCreador: datos["idVoluntarioCreador"],
                estatus: "Creada",
                token: "token"
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

    viewModel.load = function (idClient) {
        return fetch(config.apiUrl + "simulacrumGroup/searchSimulacrumDetail", {
            method: "POST",
            body: JSON.stringify({
                token: "token",
                id: idClient
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
                token: "token",
                idSimulacro: idSimulacrum
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
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

module.exports = SismoGroupViewModel;