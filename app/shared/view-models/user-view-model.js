var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var appSettings = require("application-settings");
var Toast = require("nativescript-toast");
var toast;

function UserViewModel(items) {

    var viewModel = new ObservableArray(items);

    viewModel.login = function (datos) {
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

        return fetch(config.apiUrl + "voluntaryCreator/registryVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                correo: datos['correo'],
                contrasena: datos['contrasena'],
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
        return fetch(config.apiUrl + "voluntaryCreator/existsVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                folio: folio,
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
            //Agregar al appsettings lo que recibimos...
            //appSettings
            
        });
    };

    viewModel.logout = function () {
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
        return fetch(config.apiUrl + "voluntaryCreator/updateVoluntaryCreator", {
            method: "POST",
            body: JSON.stringify({
                idVoluntario: appSettings.getNumber("idUser"),
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
        console.log("Hola hay un error.");
        //viewToast(response.statusText);
        throw Error(response.statusText);

    }
    return response;
}

function viewToast(message) {
    toast = Toast.makeText(message, "long");
    toast.show();
}

module.exports = UserViewModel;