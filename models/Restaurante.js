var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;
var restauranteSchema = new Schema({  
  Image:{ type: Buffer,es_indexed:true },
  Usuario: {type:String,es_indexed:true},
  NombrePlato: {type:String,es_indexed:true},
  Descripcion: {type:String,es_indexed:true},
  Tags: { type:String, es_indexed:true },
  Ciudad: {type:String,es_indexed:true},
  NombreRestaurante: {type:String,es_indexed:true},
  Precio: { type:String, es_indexed:true },
  Coordenada: { type:[String], es_indexed:false },
  Likes:{type:[String],es_indexed:true}
});
module.exports=restauranteSchema;