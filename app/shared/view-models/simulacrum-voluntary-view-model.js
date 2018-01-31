var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");

function SimulacrumVoluntaryViewModel(items) {
    var viewModel = new ObservableArray(items);
    viewModel.addVoluntary = function (datos) {
        return fetch(config.apiUrl + "voluntarySimulacrum/updateVoluntarySimulacrum", {
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

    viewModel.loadSimulacrum = function (idClient) {
        return fetch(config.apiUrl + "voluntarySimulacrum/listSimulacrumClient", {
            method: "POST",
            body: JSON.stringify({
                idClient: idClient
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
                //console.dir(data);
                return data;
            });
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

module.exports = SimulacrumVoluntaryViewModel;