var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var toast;

function UserViewModel(items) {

    var viewModel = new ObservableArray(items);

    viewModel.login = function (datos) {
        // uri Defined config.apiUrl
        return fetch(config.apiUrl + "voluntaryCreator/registryVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                correo: datos['correo'],
                contrasena: datos['contrasena']
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


    viewModel.add = function (userData) {
        //console.log("JSON -------> " + JSON.stringify(userData));
        //console.log("NOMBRE QUE LE MANDO DEL JS --------------->" + userData.name);
        return fetch(config.apiUrl + "voluntaryCreator/addVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                nombre: userData.name,
                contrasena: userData.password,
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
            return data;
        });
    };

    viewModel.searchFolio = function (folio) {
        console.log(folio);
        return fetch(config.apiUrl + "voluntaryCreator/existsVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                folio: folio,
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
            //Agregar al appsettings lo que recibimos...
            //appSettings
            
        });
    };

    viewModel.logout = function () {
        
        return fetch(config.apiUrl + "voluntaryCreator/updateVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                idVoluntario: appSettings.getNumber("idUser"),
                token: appSettings.getString("tokenUser")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(handleErrors)
        .then(function (response) {
            return response.json();s
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

module.exports = UserViewModel;