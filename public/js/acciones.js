// var MongoClient = require('mongodb').MongoClient;
// var url = 'mongodb://localhost:27017/EASbd';
// var fs = require('fs');
// var path = require('path');
// //var upload = require('./public/upload');
// var mongoose = require('mongoose');
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb+srv://user:1234@db-0clnu.mongodb.net/1234?retryWrites=true');
// require("./models/Receta");
// var Photo = mongoose.model('Receta');
// var fs = require('fs');

var Jimp = require('jimp');
$(document).ready(function () {
    $("#botonRegistro").click(function () {
        $.ajax({
            type: 'GET',
            url: '/registro',
            success: function (data) {
                $("#registroDiv").html(data);
            }
        });
    });

    // $("#submitForm").click(function () {
    //     var ingredientes=$("#IngredientesUp").val();
    //     var nombre=$("#NameUp").val();
    //     var proceso=$("#RecetaUp").val();
    //     var fileName=$("#imageUP").val();
    //     var reader = new FileReader();
    //     // if (fileName) {
    //     // // create reader
            
            
    //     //     reader.onload = function(e) {
    //     //     // browser completed reading file - display it
    //     //         alert(e.target.result);
    //     //     };
    //     // }
    //     Jimp.read(fileName, (err, file) => {
    //     if (err) throw err;
    //         file.resize(100, 100) // resize
    //         file.write(fileName); // save
    //     });
    //     var formData = new FormData();
    //     formData.append('imageUP', reader.readAsText(fileName), fileName);
    //     formData.append('IngredientesUp',ingredientes);
    //     formData.append('NameUp',nombre);
    //     formData.append('RecetaUp',proceso);
    //     $.ajax({
    //         type: 'POST',
    //         url: '/upload',
    //         data: formData,
    //         success: function (data) {
                
    //         }
    //     });
    // });

    $("#botonVoler").click(function () {
        $.ajax({
            type: 'GET',
            url: '/',
            success: function (data) {
                $("#cuadrado").html(data);
            }
        });
    });

    $("#botonRegistrame").click(function () {
        var username = $("#Usuario").val();
        var password = $("#Contrasenya").val();
        var registerData = { 'username': username, 'password': password };
        $.ajax({
            type: 'POST',
            url: '/register_action',
            data: registerData,
            success: function (data) {
                $("#cuadrado").html(data);
            }
        });
    });

    $("#botonRegistrame").click(function () {
        var username = $("#Usuario").val();
        var password = $("#Contrasenya").val();
        var registerData = { 'username': username, 'password': password };
        $.ajax({
            type: 'POST',
            url: '/register_action',
            data: registerData,
            success: function (data) {
                $("#cuadrado").html(data);
            }
        });
    });

    $("#UploadRecipe").click(function () {
		console.log("entro");
		var rutaImagen =$("#imageUP").val();
		var ingredientes =$("#IngredientesUp").val();
		var nombre =$("#NameUp").val();
		var proceso =$("#RecetaUp").val();
		var registeredRecipe={'nombre': nombre,'ingredientes':ingredientes,'proceso':proceso,'imagen':imagen};
		$.ajax({
            type: 'POST',
            url: '/upload',
            data: registeredRecipe,
            
        });
		console.log("hola");
		MongoClient.connect(url, function (err, db) {
			if (err) throw err;
			var collection = db.collection('Receta');
			var rec=collection.find();
			console.log(rec.Nombre);
  
		});
		
    });

});

