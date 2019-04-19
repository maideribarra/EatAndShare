const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const app = express();  
const Jimp = require('jimp');
const cheerio = require('cheerio');
var FormData = require('form-data');
var http = require('http').Server(app);
var request = require('request');
// Middleware
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
var fs = require('fs');
const Resize = require('./public/js/Resize');
var im = require('imagemagick');
var cors = require('cors');
//app.use(require('express-ajax'));
var resizeImage = require('resize-image');
var mongoosastic=require("mongoosastic");
// Mongo URI
const mongoURI = 'mongodb://localhost:27017/EASbd';
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

// Create mongo connection

const conn = mongoose.createConnection(mongoURI,function(error) {
  // Check error in initial connection. There is no 2nd param to the callback.
  console.log(error);
});
var recetaSchema =require("./models/Receta");
var recS=recetaSchema.plugin(mongoosastic);
var Mreceta = conn.model('recipe', recS),stream = Mreceta.synchronize({}, {saveOnSynchronize: true}),count = 0;



// Init gfs
let gfs;

//conn.once('open', () => {
  // Init stream
  //gfs = Grid(conn.db, mongoose.mongo);  
  //gfs.collection('recipe');
//});

const UPLOAD_PATH = 'uploads';

const upload = multer();


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


    
function migracion(){
  var recetaSchema = new mongoose.Schema({  
  Image:Object,
  Ingredientes:{type:Array,es_indexed:true},
  Nombre: {type:String,es_indexed:true},
  Proceso: { type:String, es_indexed:true },
  Tags: { type:String, es_indexed:true },
  Usuario:String,
  Likes:Array
});
  recetaSchema.plugin(mongoosastic);
var receta = mongoose.model('recipe', recetaSchema),stream = receta.synchronize({}, {saveOnSynchronize: true}),count = 0;

 
stream.on('data', function(err, doc){
  count++;
  console.log(count);
});
stream.on('close', function(){
  console.log('indexed ' + count + ' documents!');
});
stream.on('error', function(err){
  console.log(err);
});


}

    
    

app.post('/upload',upload.single('fileToUpload'), (req, res) => {
  var Mreceta = conn.model('recipe', recS),stream = Mreceta.synchronize({}, {saveOnSynchronize: true}),count = 0;
  console.log("entro");  
  var jsonArrayIngredientes=[];
  var arrayIngredientes=req.body.ListaIngredientes.split('%');
  console.log("arrayIngredientes");
  console.log(arrayIngredientes);
  var i;
  for (i = 0; i < arrayIngredientes.length; i++) {
      var arrayComponentesIngrediente=arrayIngredientes[i].split('-');
      var ingredienteJson={"nombre":arrayComponentesIngrediente[0], "cantidad":arrayComponentesIngrediente[1],"medida":arrayComponentesIngrediente[2]};
      jsonArrayIngredientes.push(ingredienteJson);
      console.log("ingredienteJSON");
      console.log(ingredienteJson);
  } 
   //var collection = conn.db.collection('recipe');
  Mreceta.insertMany([{//"Image":req.file,"Ingredientes": jsonArrayIngredientes,
             "Nombre": req.body.NameUp,//string
             "Proceso": req.body.RecetaUp,
             "Tags": req.body.TagsUp,
             "Descripcion": req.body.Descripcion,
             "Usuario": req.body.Usuario,
            // "Likes" : [],
           }], function (err) {
      if (err){ 
          console.log(error);
      } else {
        console.log("Multiple documents inserted to Collection");
        res.redirect('/');
      }
    });  
  
  
});

app.post('/getCalorias',upload.single(), function (req, res) {
      var collection = conn.db.collection('food');        
          console.log("imprimo comida");      
      var data=req.body.ingredientes;
      console.log(req.body);
      console.log(req.body.ingredientes);
      console.log(req.body.cantidad);
      console.log(req.body.tipo);
      
      collection.find({nameSP: req.body.ingredientes},{ projection: {_id:0, energy:1}}
).toArray( function (err, cal) {
            if (err) throw err;
            var resultado=parseFloat(cal[0]['energy'])*parseFloat(req.body.cantidad)/100.0;
            console.log(cal);
            console.log(parseFloat(cal[0]['energy']));
            console.log(parseFloat(req.body.cantidad));
           res.json({array: resultado});  
          });  

  });
app.get('/food', function (req, res) {
      var collection = conn.db.collection('food');        
          console.log("imprimo comida");        
          collection.find({},{ projection: {_id:0, nameSP:1}}
).toArray( function (err, food) {
            if (err) throw err;
            console.log({array:food});
            res.render('uploadRecipe', { array:food });  
          });  

  });


async function search(){
   const response = await client.search({
  index: 'twitter',
  type: 'tweets',
  body: {
    query: {
      match: {
        body: 'elasticsearch'
      }
    }
  }
})
 
for (const tweet of response.hits.hits) {
  console.log('tweet:', tweet);
}

}

app.get('/', (req, res) => {
  //migracion();
  //search();
  var collection = conn.db.collection('recipe');
  var photos;
  collection.find({}, function (err, items) {
    console.log(items.length);
    photos=items;
     if (items.length === 0) {
      photos=false;
    } else {
      console.log(items[1]);
          
  }
  });
  var collection = conn.db.collection('food');        
          console.log("imprimo comida");       
          
          collection.find({},{ projection: {_id:0, nameSP:1}}
).toArray( function (err, food) {
            var valores=[];
            for (x=0;x<food.length;x++){
              valores.push(Object.values(food[x])[0]);
            }
            if (err) throw err;
            res.render('uploadRecipe', { array:valores, files: photos });  
          }); 
    //Check if files
    
    
   
});
app.get('/index', (req, res) => {
  var collection = conn.db.collection('recipe');
  var photos;
  collection.find().toArray((err, items) => {
    console.log(items.length);
    photos=items;
     if (items.length === 0) {
      res.render('index', { items: false });
    } else {
      console.log(items[1]);
      res.render('index', { items: items });
  }
  });
   
  });
          
app.post('/addLike',upload.single(), (req, res) => {
  console.log(req.body.Usuario);
  var collection = conn.db.collection('recipe');
  collection.find({_id: req.body.RecetaId},{ projection: {_id:0, likes:1}}
).toArray( function (err, array) {
            if (err) throw err;
            if (array.length>0){
              if(array[0].includes(req.body.Usuario)){
                var filtered = array[0].filter(function(value, index, arr){

                  return value!=req.body.Usuario;

                });

                collection.update({_id: req.body.RecetaId},{$set: { "Likes" : filtered}});
                res.json({cantLikes: filtered.length }); 
          
              }else{
                array[0].push(req.body.Usuario);
                collection.update({_id: req.body.RecetaId},{$set: { "Likes" : array[0]}});
                res.json({cantLikes: array[0].length });
            
          }}else{
            var array=[];
            array.push(req.body.Usuario);
            collection.updateOne({_id: req.body.RecetaId},{$set: { "Likes" : array}});
            console.log(array);
            console.log(req.body.Usuario);
          }})});  
 
  




const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));