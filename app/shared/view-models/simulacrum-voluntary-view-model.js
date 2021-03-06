var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var url = "";

function SimulacrumVoluntaryViewModel(items) {
    var viewModel = new ObservableArray(items);
    url = appSettings.getString("url");
    viewModel.addVoluntarySimulacrum = function (datos) {
        var date = new Date();
        //console.log(date.toString());
        var monthModified = "";
        if ((date.getMonth() + 1) < 10) {
            monthModified = "0" + (date.getMonth() + 1);
        } else {
            monthModified = (date.getMonth() + 1);
        }
        var fecha = date.getFullYear() + "-" + monthModified + "-" + date.getDate();
        console.log(fecha);
        var tiempo = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(tiempo);
        console.log("Entre a la peticion");
        return fetch(config.apiUrl + "voluntarySimulacrum/addVoluntarySimulacrum", {
            method: "POST",
            body: JSON.stringify({
                idVoluntario: datos["idVoluntario"],
                idSimulacro: datos["idSimulacro"],
                tiempo_inicio: datos["tiempo_inicio"],
                tiempo_estoy_listo: datos["tiempo_estoy_listo"],
                mensajeVoluntario: datos["mensajeVoluntario"],
                tipoSimulacro: datos["tipoSimulacro"],
                altitud: datos["altitud"],
                tagVoluntario: datos["tagVoluntario"],
                token: appSettings.getString("tokenUser"),
                fecha: fecha,
                hora: tiempo
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

    viewModel.deleteVoluntary = function (datos) {
        var date = new Date();
        //console.log(date.toString());
        var monthModified = "";
        if ((date.getMonth() + 1) < 10) {
            monthModified = "0" + (date.getMonth() + 1);
        } else {
            monthModified = (date.getMonth() + 1);
        }
        var fecha = date.getFullYear() + "-" + monthModified + "-" + date.getDate();
        console.log(fecha);
        var tiempo = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(tiempo);
        return fetch(config.apiUrl + "voluntarySimulacrum/deteleVoluntaryOfSimulacrum", {
            method: "POST",
            body: JSON.stringify({
                idVoluntario: datos["idVoluntario"],
                idSimulacro: datos["idSimulacro"],
                token: appSettings.getString("tokenUser"),
                fecha: fecha,
                hora: tiempo
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
        var date = new Date();
        //console.log(date.toString());
        var monthModified = "";
        if ((date.getMonth() + 1) < 10) {
            monthModified = "0" + (date.getMonth() + 1);
        } else {
            monthModified = (date.getMonth() + 1);
        }
        var fecha = date.getFullYear() + "-" + monthModified + "-" + date.getDate();
        console.log(fecha);
        var tiempo = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(tiempo);
        return fetch(config.apiUrl + "voluntarySimulacrum/searchDetailVoluntaryOfVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                idVoluntario: idClient,
                token: appSettings.getString("tokenUser"),
                fecha: fecha,
                hora: tiempo
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

    viewModel.searchDateAndHour = function (idSimulacrumGroup) {
        console.log("Entre a la peticion de buscar Voluntario simulacro ---> " + idSimulacrumGroup);
        var date = new Date();
        //console.log(date.toString());
        var monthModified = "";
        if ((date.getMonth() + 1) < 10) {
            monthModified = "0" + (date.getMonth() + 1);
        } else {
            monthModified = (date.getMonth() + 1);
        }
        var fecha = date.getFullYear() + "-" + monthModified + "-" + date.getDate();
        console.log(fecha);
        var tiempo = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(tiempo);
        return fetch(config.apiUrl + "voluntarySimulacrum/searchDateAndHourSimulacrum", {
            method: "POST",
            body: JSON.stringify({
                idSimulacrumGroup: idSimulacrumGroup,
                token: appSettings.getString("tokenUser"),
                fecha: fecha,
                hora: tiempo
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

    viewModel.updateVoluntarySimulacrum = function (datos) {
        var date = new Date();
        //console.log(date.toString());
        var monthModified = "";
        if ((date.getMonth() + 1) < 10) {
            monthModified = "0" + (date.getMonth() + 1);
        } else {
            monthModified = (date.getMonth() + 1);
        }
        var fecha = date.getFullYear() + "-" + monthModified + "-" + date.getDate();
        console.log(fecha);
        var tiempo = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(tiempo);
        return fetch(config.apiUrl + "voluntarySimulacrum/updateVoluntarySimulacrum", {
            method: "POST",
            body: JSON.stringify({
                idVoluntarioSimulacro: datos["idVoluntarioSimulacro"],
                tiempo_estoy_listo: datos["tiempoEstoyListo"],
                tiempo_inicio: datos["tiempoInicio"],
                tagVoluntario: datos["tagVoluntario"],
                token: appSettings.getString("tokenUser"),
                fecha: fecha,
                hora: tiempo,
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
    }

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