var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var toast;

function SimulacrumIndividualViewModel(items) {
    var viewModel = new ObservableArray(items);
    viewModel.addSimulacrumIndividual = function (datos) {
        //console.dir(datos);
        return fetch(config.apiUrl + "voluntarySimulacrumIndividual/addVoluntarySimulacrumIndividual", {
            method: "POST",
            body: JSON.stringify({
                idVoluntario: datos["idVoluntario"],
                tiempo_inicio: datos["tiempo_inicio"],
                tiempo_estoy_listo: datos["tiempo_estoy_listo"],
                fecha: datos['fecha'],
                hora: datos['hora'],
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
                console.dir(data);
                return data;
            });
    };

    viewModel.load = function (idCreator) {
        return fetch(config.apiUrl + "voluntarySimulacrumIndividual/getAllSimulacrumByCreator", {
            method: "POST",
            body: JSON.stringify({
                token: "token",
                idVoluntaryCreator: idCreator
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

    viewModel.delete = function (id) {
        return fetch(config.apiUrl + "voluntarySimulacrumIndividual/deteleVoluntaryOfSimulacrumIndividual", {
            method: "POST",
            body: JSON.stringify({
                token: "token",
                id: id
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

module.exports = SimulacrumIndividualViewModel;