var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");

function SismoGroupViewModel(items) {
    var viewModel = new ObservableArray(items);

    viewModel.load = function (idClient) {
        //console.log("ID del Cliente ------> " + idClient);
        //var itemsListSismoGroup = new ObservableArray();
        //console.log("JSON ----------> " + JSON.stringify({id:idClient}));
        return fetch(config.apiUrl + "sismoGrupo/buscarSismoDetalle", {
            method: "POST",
            body: JSON.stringify({
                id: idClient
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(handleErrors)
        .then(function (response) {
            //console.log("FINAL");
            return response.json();
        }).then(function (data) {
            //console.log("SUCCESS");
            //console.dir(data.response);
            console.dir(data);
            data.response.forEach(function (client) {
                console.log("ID ----------------- > " + client.id);
                viewModel.push({
                    id: client.id,
                    ubicacion: client.ubicacion,
                    latitud: client.latitud,
                    longitud: client.longitud,
                    fecha: client.fecha,
                    hora: client.hora,
                    participantes: client.participantes,
                    idUsuario: client.idUsuarios
                });
            });
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
    //console.log("ERROR");
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

module.exports = SismoGroupViewModel;