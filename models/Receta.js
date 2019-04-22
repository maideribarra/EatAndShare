var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;
var ingredienteSchema = new Schema ({nombre:String,cantidad:Number,medida:String});
var recetaSchema = new Schema({  
  Image:{ type: Buffer,es_indexed:true },
  Ingredientes:{type:[ingredienteSchema],es_indexed:true},
  Nombre: {type:String,es_indexed:true},
  Proceso: { type:String, es_indexed:true },
  Tags: { type:String, es_indexed:true },
  Usuario:{type:String,es_indexed:true },
  Likes:{type:[String],es_indexed:true}
});
module.exports=recetaSchema;