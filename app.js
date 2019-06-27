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
var request = require('request');
var http = require('http');
var json = require('json');
var url = require('url');
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
//var mongoURI = 'mongodb+srv://user:1234@db-0clnu.mongodb.net/1234?retryWrites=true';
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
var restauranteSchema=require("./models/Restaurante");



var recS=recetaSchema.plugin(mongoosastic);
var resS=restauranteSchema.plugin(mongoosastic);
var Mreceta = conn.model('recipe', recS),stream = Mreceta.synchronize({}, {saveOnSynchronize: true}),count = 0;
var Mrestaurante = conn.model('restaurant', resS),stream = Mrestaurante.synchronize({}, {saveOnSynchronize: true}),count = 0;



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
  Image:{Object,
  Ingredientes:{type:Array,es_indexed:true},
  Nombre: {type:String,es_indexed:true},
  Proceso: { type:String, es_indexed:true },
  Tags: { type:String, es_indexed:true },
  Usuario: {type:String,es_indexed:true},
  Likes:{type:Array,es_indexed:true}
}});
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
var resultado=[];
var arraySearchSugestion=[];
async function searchSuggestion(phrase){
  var arrayResultado=[];
  const options = {  hostname: 'localhost',  port: 9200,  path: '/recipes/_search',  method: 'POST'};
  const reque = http.request(options, (resp) => {
  //console.log(`STATUS: ${resp.statusCode}`);
  //console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
  resp.setEncoding('utf8');
  var body="";
  resp.on('data', (chunk) => {
    //console.log(`BODY: ${chunk}`);
    body+=chunk;

   
  });
  resp.on('end',async function() {
    //console.log('No more data in response.');
    //console.log(body);
     var jbody=await JSON.parse(body);
     arraySearchSugestion=jbody["hits"]["hits"];
     var j=0;
    //console.log("arraySearchSugestion");

    //console.log(arraySearchSugestion);
    
    for(j;j<arraySearchSugestion.length;j++){
     arraySearchSugestion[j]["_source"]["_id"]=arraySearchSugestion[j]["_id"];
      resultado.push(arraySearchSugestion[j]["_source"]);
    }
   // resultado=resultado.concat(arraySearchSugestion);
    //console.log("resultado");
    //console.log(resultado);
    
     
  });
});

reque.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
reque.setHeader('Content-Type', 'application/json');
var queryPlantilla={"query": {"multi_match" : {"query":"freir carne","type":"phrase","fields":[ "Nombre", "Proceso","Tags" ]}}};
queryPlantilla["query"]["multi_match"]["query"]=phrase;
reque.write(JSON.stringify(queryPlantilla));
reque.end();


}
async function concatSugesstions(body){
  var arrayResultado=[];
   var respuesta= await JSON.parse(body);
    var respNombre=await takeResponseSugesstions('my-suggestion',respuesta);
    var respProceso=await takeResponseSugesstions('my-suggestion2',respuesta);
    var respTags=await takeResponseSugesstions('my-suggestion3',respuesta);
    arrayResultadoM=await respNombre.concat(respProceso);
    arrayResultado=await arrayResultadoM.concat(respTags);
    //console.log(arrayResultado);
    //console.log("devuelvo resultado");
    return arrayResultado;
     //do something        
      //return arrayResultado;
}
var flag=false;
var arraySugesstions=[];
function getSugetions(phrase){
  
  const options = {  hostname: 'localhost',  port: 9200,  path: '/recipes/_search',  method: 'POST'};
  const reque = http.request(options, (resp) => {
    //console.log(`STATUS: ${resp.statusCode}`);
    //console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
    resp.setEncoding('utf8');
    var body="";
    resp.on('data', (chunk) => {
      //console.log(`BODY: ${chunk}`);
      body+=chunk;


  });
  resp.on('end', () => {
    flag=true;
    //console.log('No more data in response.');
     arraySugesstions= concatSugesstions(body);
          
  });
  
    //do what you need here
   

  

});

reque.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
reque.setHeader('Content-Type', 'application/json');
var bodyRequestPlantilla = {"suggest" : {"text" : "piza aceituna","my-suggestion" : {"phrase" : {"field" : "Ingredientes.nombre"}},"my-suggestion2" : {"phrase" : {"field" : "Proceso"}},"my-suggestion3" : {"phrase" : {"field" : "Tags"}}}};
bodyRequestPlantilla["suggest"]["text"]=phrase;
//console.log(bodyRequestPlantilla);
reque.write(JSON.stringify(bodyRequestPlantilla));
reque.end();

}

function takeResponseSugesstions(sugesstion,respuesta){
  var arrayResultado=[];
  var respIngrediente=respuesta['suggest'][sugesstion][0]['options'];
      if(respIngrediente.length>0){
        var i=0;
        for(i;i<respIngrediente.length;i++){
          arrayResultado.push(respIngrediente[i]['text']);
        }
      
      }
      return arrayResultado;
}
//async function getResultSuggestion(value,i){
  // var resultadoSugesstion=[];
  // var resultado=[];
      
    //  arraySS=searchSuggestion(value[i]);    

//}
app.get('/search/:text?',async function (requ, re) {
  var phrase=requ.params['text'];
  flag=false;
  getSugetions(phrase);  
   setTimeout(function(){
    //do what you need here
    var i=0;
  
  
  arraySugesstions.then(async function(value) {
    //console.log("Sugesstions");
    //console.log(value);
    for(i;i<value.length;i++){
      //var res= await getResultSuggestion(value,i);
      searchSuggestion(value[i]);
      

   }
   setTimeout(function(){
  console.log("RENDERIZO");
  console.log(resultado);
re.render('index', { items: resultado });
resultado=[];

}, 4000);
 
});
    
}, 4000);
 
  
});

function getProductName(jsonObj){
	var arr=Object.keys(jsonObj['product']);
	var pat='product_name';
	var i;
	for (i = 0; i < arr.length; i++) {
		console.log(arr[i]);
		if(arr[i].search(pat)!=-1){
			console.log(arr[i]);
			return arr[i];
		}
	};
	
}

app.get('/barcode/:id?/:cantidad?', function (requ, re) {
  var code = requ.params['id'];
  console.log("code:");
  console.log( code);
  console.log(requ.params['cantidad']);
  var str1='/api/v0/product/';
  var path=str1.concat(code);
  //https://world.openfoodfacts.org/api/v0/product/8410066108572
   var arrayResultado=[];
  const options = {
  hostname: 'world.openfoodfacts.org',
  path: path,
  method: 'GET',
};
 var body = "";
const reque = http.request(options, (resp) => {
  console.log(`STATUS: ${resp.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
  resp.setEncoding('utf8');
  resp.on('data', (chunk) => {
    body+=chunk;
    //console.log(`BODY: ${body}`);
      });
  resp.on('end', () => {
    console.log('No more data in response.');
    var jsingrediente=JSON.parse(body);
	var nombre=getProductName(jsingrediente);
	console.log(nombre);
    var ingrediente={name: jsingrediente['product'][nombre],calorias :jsingrediente['product']['nutriments']['energy_value'],medida:jsingrediente['product']['nutriments']['energy_unit'],image:jsingrediente['product']['image_nutrition_small_url']};
    console.log(ingrediente);
    var kcal  =  ingrediente['calorias'];
    var kcalTotal =  getCaloriasPerCant(kcal,requ.params['cantidad']);
    re.json({calorias: kcalTotal,imagen:ingrediente['image'],name:jsingrediente['product'][nombre]});
  });
});

reque.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
reque.setHeader('Content-Type', 'application/json');
reque.end();
//re.redirect('/');

});


    

app.post('/upload',upload.single('fileToUpload'), (req, res) => {
  console.log("prueba rapidminer");
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
  Mreceta.insertMany([{"Image":req.file.buffer,"Ingredientes": jsonArrayIngredientes,
             "Nombre": req.body.NameUp,//string
             "Proceso": req.body.RecetaUp,
             "Tags": req.body.TagsUp,
             "Descripcion": req.body.Descripcion,
             "Usuario": req.body.Usuario,
            "Likes" : [],
           }], function (err) {
      if (err){ 
          console.log(err);
      } else {
        console.log("Multiple documents inserted to Collection");
        res.redirect('/');
      }
    });  
  
  
});

app.post('/uploadRestaurante',upload.single('fileToUpload'), (req, res) => {
  var Mrestaurante = conn.model('restaurant', resS),stream = Mrestaurante.synchronize({}, {saveOnSynchronize: true}),count = 0;
  var coorStr=req.body.Coordenada.split("%");

  console.log("Server recibio restaurante");  
  //var collection = conn.db.collection('recipe');
  Mrestaurante.insertMany([{"Image":req.file.buffer,
            "Usuario": req.body.Usuario,
             "NombrePlato": req.body.Nombre,//string
             "Descripcion": req.body.Descripcion,
             "Tags": req.body.Tags,
             "Ciudad": req.body.Ciudad,
             "NombreRestaurante": req.body.Restaurante,
            "Precio" : req.body.Precio,
            "Coordenada" : coorStr,
            "Likes" : []
           }], function (err) {
      if (err){ 
          console.log(err);
      } else {
        console.log("Multiple documents inserted to Collection");
        res.redirect('/');
      }
    });  
  
  
});


function getCaloriasPerCant(energy,cantidad){
  return parseFloat(energy)*parseFloat(cantidad)/100.0;

}

function toKcal(kJ){
  return parseFloat(kJ)*0.2388; 
}

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
            var resultado=getCaloriasPerCant(cal[0]['energy'],req.body.cantidad);
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


async function GetCluster(usuario){
	var fileContent;
	var resultado =-1;
    const csvCluster= new Promise(function(resolve) {
        fileContent = fs.readFileSync('C:\\recomendador\\cluster.csv', {encoding: 'utf8'});
        resolve(fileContent);
    });
	return csvCluster.then(function(value) {
        var rows = value.split("\r\n");
		var i=0;
		for (var i = 0; i < rows.length; i++) {
			var val=rows[i].split(";");
			var str1="\"";
			var str=str1.concat(usuario);
			var str2=str.concat(str1);
			if(str2===(val[val.length-3])){
				console.log(val[val.length-1]);
				resultado=val[val.length-1];
				return resultado;
			}
		}
		
	});
}
	
async function GetCentroids(cluster){
	var xlsx = require('node-xlsx');
	const obj = new Promise(function(resolve) {
		xlsx.parse('C:\\recomendador\\centroides.xlsx');
	});
	return obj.then(function(value) {
	var i;
	var lista=[];
	for (var i=0; i< obj[0]['data'].length;i++){		
		var row=obj[0]['data'][i];
		console.log(row[row.length-1]);
		if(cluster===row[row.length-1]){
			
			for (var j=0; j< row.length;j++){
				if(row[j]>0.4){
					console.log("entro");
					console.log(obj[0]['data'][0][j]);
					lista.push(obj[0]['data'][0][j]);
				}
				
			}
			console.log(lista);
			return lista;
		}
	}
	});
}

async function getPlatosRecomendados(array,res){
	arrId=[];
	for(var i=0;i<array.length;i++){
		arrId.push(mongoose.Types.ObjectId(array[i]));
		
	}
	var colRecipes = conn.db.collection('recipes');
	var colRestaurants = conn.db.collection('restaurants');
	colRecipes.find( { _id: { $in: arrId } }).toArray((err, recetas) => {
		colRestaurants.find( { _id: { $in: arrId } }).toArray((err, restaurantes) => {		
    console.log(recetas);
	 console.log(restaurantes);
    recetas.concat(restaurantes);
     if (recetas.length === 0) {
      res.render('index', { items: false });
	  return 0;
    } else {
      console.log(recetas);
      res.render('index', { items: recetas });
	  return 0;
  }
  });
    console.log(recetas.length);
     if (recetas.length === 0) {
      res.render('index', { items: false });
	  return 0;
    } else {
      console.log(recetas);
      res.render('index', { items: recetas });
	  return 0;
  }
  });
	
}

async function sendData(usuario,res){
	var numCluster= GetCluster(usuario);
	setTimeout(function(){
		console.log("num clusters");
		console.log(numCluster);

		const centroids=GetCentroids(numCluster);
		setTimeout(function(){
			centroids.then(function(value) {
			console.log("centroides");
			console.log(centroids);
			getPlatosRecomendados(value,res);
			});
			 }, 15000);
		
  }, 10000);
  
}

app.get('/recomendar/:usuario?', (req, res) => {
  var usuario=req.params['usuario'];  
  
  var nwDir = path.dirname(process.execPath);
  const { spawn } = require('child_process');
  var processpy = spawn('python',["-u",nwDir+"\\..\\..\\recomendador\\anyadirLikes.py"] ); 
  processpy.stdout.on('data', (data) => {
  console.log(data.toString());
	});

  processpy.stderr.on('data', (data) => {
  console.log(data.toString());
  });

  processpy.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
	const child = spawn('cmd.exe', ['/c', 'rapidminer-batch.bat', '-f', nwDir+'\\..\\..\\recomendador\\recomendatios.rmp']);
	child.stdout.on('data', (data) => {
	console.log(data.toString());
	});

	child.stderr.on('data', (data) => {
	console.log(data.toString());
	});

	child.on('exit', (code) => {
	console.log(`Child exited with code ${code}`);
	sendData(usuario,res);
	
	});

  });
  setTimeout(function(){ }, 10000);
  
  
   
});



app.get('/', (req, res) => {
  var nwDir = path.dirname(process.execPath);
  const { spawn } = require('child_process');
  var processpy = spawn('python',["-u",nwDir+"\\..\\..\\recomendador\\anyadirLikes.py"] ); 
  processpy.stdout.on('data', (data) => {
  console.log(data.toString());
	});

  processpy.stderr.on('data', (data) => {
  console.log(data.toString());
  });

  processpy.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
	const { spawn } = require('child_process');
	var nwDir = path.dirname(process.execPath);
	const child = spawn('cmd.exe', ['/c', 'rapidminer-batch.bat', '-f', nwDir+'\\..\\..\\recomendador\\recomendatios.rmp']);
	child.stdout.on('data', (data) => {
	console.log(data.toString());
	});

	child.stderr.on('data', (data) => {
	console.log(data.toString());
	});

	child.on('exit', (code) => {
	console.log(`Child exited with code ${code}`);
	});

  });
  
  //migracion();
  //search();
  var collection = conn.db.collection('recipes');
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

app.get('/inicio', (req, res) => {
  //migracion();
  //search();
  
    res.render('inicio',{});
    
   
});
app.get('/restaurante', (req, res) => {
      res.render('Restaurant',{});
    
  
   
  });
app.get('/index', (req, res) => {
  var collection = conn.db.collection('recipes');
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

app.get('/restaurantesVecinos/:x?/:y?', (req, res) =>{
  var x=req.params['x'];
  var y=req.params['y'];
  console.log(x);
  console.log(y);
  
   var collection = conn.db.collection('restaurants');
   var arrCoor=[];
    var METERS_PER_MILE = 1609.34;
    console.log("vecinos");
    //collection.find({ $nearSphere:[ x,y ] , $maxDistance: 5 * METERS_PER_MILE },{ projection: {_id:0, Coordenada:1}}).toArray((err, items) => {
      //console.log(items);
 
  collection.find({},{ projection: {Coordenada:1,NombreRestaurante:1,_id:0}}).toArray((err, items) => {
    var arrCoord=[];
    var i=0;
    for (i;i<items.length;i++){
      var coor=items[i]['Coordenada'];
      var r=(x-coor[0])^2+(y-coor[1])^2;
      console.log(r);
      if (r<1000){
        arrCoor.push(items[i]);
      }

    }
    console.log(items.length);
    
     if (arrCoor.length === 0) {
      res.json({ items: false });
    } else {
      console.log(arrCoor);
      res.json({ items: items });
  }
  });
});
   




app.get('/VRestaurantes', (req, res) => {
  var collection = conn.db.collection('restaurants');
  collection.find().toArray((err, items) => {
    console.log(items.length);
    photos=items;
     if (items.length === 0) {
      res.render('indexRestaurante', { items: false });
    } else {
      console.log(items[1]);
      res.render('indexRestaurante', { items: items });
  }
  });
   
  });

app.post('/addLikeRestaurant',upload.single(), (req, res) => {
  console.log(req.body.Usuario);
  var collection = conn.db.collection('restaurants');
  collection.find({_id:mongoose.Types.ObjectId(req.body.RestauranteId)},{ projection: {Likes:1}}
).toArray( function (err, array) {
            console.log(array);
            if (err) throw err;
            if (array[0]['Likes'].length>0){
              if(array[0]['Likes'].includes(req.body.Usuario)){
                var filtered = array[0]['Likes'].filter(function(value, index, arr){

                  return value!=req.body.Usuario;

                });
                var collection = conn.db.collection('restaurants');
                collection.updateOne({_id: mongoose.Types.ObjectId(req.body.RestauranteId)},{$set: { "Likes" : filtered}});
                res.json({cantLikes: filtered.length }); 
          
              }else{
                var collection = conn.db.collection('restaurants');
                array[0]['Likes'].push(req.body.Usuario);
                collection.update({_id: mongoose.Types.ObjectId((req.body.RestauranteId))},{$set: { "Likes" : array[0]['Likes']}});
                res.json({cantLikes: array[0]['Likes'].length });
            
          }}else{
            var collection = conn.db.collection('restaurants');
            var array=[];
            array.push(req.body.Usuario);
            console.log(req.body.RestauranteId);
            collection.updateOne({_id: mongoose.Types.ObjectId(req.body.RestauranteId)},{$set: { "Likes" : array},$currentDate: { lastModified: true }});
            console.log(array);
            console.log(req.body.Usuario);
          }})});  
 
  

          
app.post('/addLike',upload.single(), (req, res) => {
  console.log(req.body.Usuario);
  var collection = conn.db.collection('recipes');
  collection.find({_id:mongoose.Types.ObjectId(req.body.RecetaId)},{ projection: {Likes:1}}
).toArray( function (err, array) {
            console.log(array);
            if (err) throw err;
            if (array[0]['Likes'].length>0){
              if(array[0]['Likes'].includes(req.body.Usuario)){
                var filtered = array[0]['Likes'].filter(function(value, index, arr){

                  return value!=req.body.Usuario;

                });
                var collection = conn.db.collection('recipes');
                collection.updateOne({_id: mongoose.Types.ObjectId(req.body.RecetaId)},{$set: { "Likes" : filtered}});
                res.json({cantLikes: filtered.length }); 
          
              }else{
                var collection = conn.db.collection('recipes');
                array[0]['Likes'].push(req.body.Usuario);
                collection.update({_id: mongoose.Types.ObjectId((req.body.RecetaId))},{$set: { "Likes" : array[0]['Likes']}});
                res.json({cantLikes: array[0]['Likes'].length });
            
          }}else{
            var collection = conn.db.collection('recipes');
            var array=[];
            array.push(req.body.Usuario);
            console.log(req.body.RecetaId);
            collection.updateOne({_id: mongoose.Types.ObjectId(req.body.RecetaId)},{$set: { "Likes" : array},$currentDate: { lastModified: true }});
            console.log(array);
            console.log(req.body.Usuario);
          }})});  
 
  




const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));