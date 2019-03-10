var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var recetaSchema = new Schema({
  //Usuario: { type: String },//string
  Imagen: { data: Buffer, contentType: String },// string
  Ingredientes: [{nombreIngrediente:{ type: String }}],// array
  Nombre: { type: String },//string
  Proceso: { type: String },//string
  Likes: [{usuario:{ type:String }}],//array
  Comentarios: [{usuario:{ type:String },comentario:{type:String}}]
  
  });

module.exports = mongoose.model('Receta', recetaSchema);