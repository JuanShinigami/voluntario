var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var toast;

function UserViewModel(items) {

    var viewModel = new ObservableArray(items);


    viewModel.add = function (userData) {
        console.log("JSON -------> " + JSON.stringify(userData));
        console.log("NOMBRE QUE LE MANDO DEL JS --------------->" + userData.name);
        return fetch(config.apiUrl + "voluntaryCreator/addVoluntaryCreador", {
            method: "POST",
            body: JSON.stringify({
                nombre: userData.name,
                telefono: userData.phone,
                correo: userData.email
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

                
            //data.response.forEach(function (client) {
            //    console.log("Nombre ----> " + client.alias);
            //});
        });
    };

    viewModel.searchFolio = function (folio) {
        return fetch(config.apiUrl + "voluntaryCreator/existsVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                folio: folio
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
            //Agregar al appsettings lo que recibimos...
            //appSettings
            console.log("HOLA");
        });
    };
    return viewModel;

    // Vidiriana Peréz
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

module.exports = UserViewModel;