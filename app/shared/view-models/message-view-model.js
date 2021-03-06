var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var toast;
var url = "";

function MessageViewModel(items) {

    var viewModel = new ObservableArray(items);
    url = appSettings.getString("url");
    // Peticiones
    viewModel.addMessage = function (datos) {
        var date = new Date();
        //console.log(date.toString());
        var fecha = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        console.log(fecha);
        var tiempo = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(tiempo);
        return fetch(config.apiUrl + "message/addMessage", {
            method: "POST",
            body: JSON.stringify({
                mensajeCreador: datos['idUser'],
                idSimulacrogrupo: datos['idSimulacrum'],
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

    viewModel.searchMessages = function (idUser) {
        return fetch(config.apiUrl + "message/searchMessage", {
            method: "POST",
            body: JSON.stringify({
                idVoluntario: idUser,
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


    return viewModel;

}

function handleErrors(response) {
    if (!response.ok) {
        viewToast(response.statusText);
        throw Error(response.statusText);

    }
    return response;
}

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

module.exports = MessageViewModel;