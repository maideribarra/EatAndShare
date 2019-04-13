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
//var jQuery = require('jQuery');
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
// Mongo URI
const mongoURI = 'mongodb://localhost:27017/EASbd';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);


// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  //gfs = Grid(conn.db, mongoose.mongo);  
  //gfs.collection('recipe');
});

const UPLOAD_PATH = 'uploads';

const upload = multer();


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// function compVision(image) {
        
//         var params = {
//             // Request parameters
//             "visualFeatures": "Categories,Tags,Description,Adult",
//             "details": "{string}",
//             "language": "en",
//         };
      
//         $.ajax({
//             url: "https://northeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?" + $.param(params),
//             beforeSend: function(xhrObj){
//                 // Request headers
//                 xhrObj.setRequestHeader("Content-Type","application/octet-stream");
//                 xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","{6e4d627095ec456b83752c664150eacf}");
//             },
//             type: "POST",
//             // Request body
//             data: image,
//             processData:false,
//             contentType: 'application/octet-stream'
//         })
//         .done(function(data) {
//             alert("success");
//             console.log(data);
//         })
//         .fail(function() {
//             alert("error");
            
//         });
//     };

 
// POST data then scrape the page
  
        
       
    

app.post('/upload',upload.single('fileToUpload'), (req, res) => {
  console.log("entro");
   var collection = conn.db.collection('recipe');
           collection.insertOne({"Image":req.file,"Ingredientes": req.body.IngredientesUp,
             "Nombre": req.body.NameUp,//string
             "Proceso": req.body.RecetaUp});
  //var Base64  = new Buffer(req.file.buffer);
 // console.log(Base64);
  //compVision(Base64);
  res.redirect('/');
});

app.get('/food', function (req, res) {
      var collection = conn.db.collection('food');        
          console.log("imprimo comida");        
          collection.find({},{ projection: {_id:0, nameSP:1}}
).toArray( function (err, food) {
            if (err) throw err;
            console.log({array:food});
            res.render('index', { array:food });  
          });  

  });


// app.get('/bedca', (req, res) => {
//  console.log("bedca");
//  const { remote } = require('webdriverio');
 
//  (async () => {
//     const browser = await remote({
//         logLevel: 'error',
//         path: '/',
//         capabilities: {
//             browserName: 'firefox'
//         }
//     });

//     await browser.url('http://www.bedca.net/bdpub/index.php');
//     //const nav= browser.$$('#navigation');
//     browser.$$('#navigation div:nth-child(4) a').then((value) => {
//       console.log(value);
//       value.forEach((link) => {
//         link.click();
//     });

//     });
//     browser.$('#Alfabetica').then((value) => {
//         console.log(value);      
//         value.click();
  
//     });
//      browser.$('#content #alphabet p a').then((value) => {
//       value.click();
//       setTimeout(function() {

//       browser.$$('#content2 table').then((value) => {
//         console.log("entro");         
        
//           value[1].getHTML(false).then((datos)=>{
        
//         console.log(datos);
//         //const convert = require('html-to-json-data');
//         //const html=datos;
//         //console.log(convert.group('tr', text('a')));
        
    
      

//       });
//     });
//       }, 3000);
//     });
      


        
  
    
   
    // nav.then(function(result) {
      // result.click();
//      console.log(nav[0]);
//      nav['Promise'][0].click();
//     //const link = result.$$('div')[3].$('a');
//     //console.log(link.getText());
//     //link.click();
     
//     //const listaAlfa =browser.$('#Alfabetica');
//     //listaAlfa.click();
//     //var tabla = browser.$('#content').getHTML();
//     //console.log(tabla);
    
   
//})
    

    

    //await browser.deleteSession();
//})().catch((e) => console.error(e));
 /*var options = { desiredCapabilities: { browserName: 'chrome' } }; 
 var driver = wd.remote({ capabilities: { browserName: 'chrome' } });
 driver.init();
 driver.url("http://www.bedca.net/bdpub/index_en.php");
 driver.getHTML('body', false, function(err, html) {
        if (err) {
          throw new Error(err);
        }

        this.end();
        console.log(cheerio.load(html));
      });
 */// families = driver.find_element_by_xpath("//*[@id='fglist']");
 // families_select = families.get_attribute('innerHTML');
 // console.log(families);

// req = request.defaults({
//   jar: true,                 // save cookies to jar
//   rejectUnauthorized: false, 
//   followAllRedirects: true   // allow redirections
// });

//   req.post({
//     url: "http://www.bedca.net/bdpub/procquery.php",
//     headers: {
//         'Content-Type': "text/xml" // optional headers
//      },
//      //data: "<?xml version=\"1.0\" encoding=\"utf-8\"?>    <foodquery>      <type level=\"3\"/>      <selection>        <atribute name=\"fg_id\"/>        <atribute name=\"fg_ori_name\"/>        <atribute name=\"fg_eng_name\"/>      </selection>      <order ordtype=\"ASC\">        <atribute3 name=\"fg_id\"/>      </order>    </foodquery>"
//   }, function(err, resp, file) {
  
//   // load the html into cheerio
//   var $ = cheerio.load(file, { xmlMode: true });
//   console.log($.html());
  
//   // do something with the page here
  
// });   

  // $.ajax({ url: 'ajax/bedca.php', success: function(data) { alert('Directory created'); } });
  // //var Base64  = new Buffer(req.file.buffer);
 // console.log(Base64);
  //compVision(Base64);
//   $.ajax({
//     url: 'http://www.bedca.net/bdpub/procquery.php',
//     headers: {
//               'contentType': "text/xml",

//     },
//     type: "GET",
//     data: "<?xml version=\"1.0\" encoding=\"utf-8\"?>    <foodquery>      <type level=\"3\"/>      <selection>        <atribute name=\"fg_id\"/>        <atribute name=\"fg_ori_name\"/>        <atribute name=\"fg_eng_name\"/>      </selection>      <order ordtype=\"ASC\">        <atribute3 name=\"fg_id\"/>      </order>    </foodquery>",


//     success: function (obj, textstatus) {
//                    console.log(obj);
                  
//             },
//     error : function (xhr, ajaxOptions, thrownError){  
//         console.log(xhr.status);          
//         console.log(thrownError);
//     } 
// });
//});


app.get('/', (req, res) => {
  var collection = conn.db.collection('recipe');
  var photos;
  collection.find().toArray((err, items) => {
    console.log(items.length);
    photos=items;
//     $.ajax({
//     type: "POST",
//     url: 'http://www.bedca.net/bdpub/procquery.php',
//     contentType: "text/xml",
//     data: "<?xml version=\"1.0\" encoding=\"utf-8\"?>    <foodquery>      <type level=\"3\"/>      <selection>        <atribute name=\"fg_id\"/>        <atribute name=\"fg_ori_name\"/>        <atribute name=\"fg_eng_name\"/>      </selection>      <order ordtype=\"ASC\">        <atribute3 name=\"fg_id\"/>      </order>    </foodquery>",

//     success: function (obj, textstatus) {
//                    console.log(obj);
                  
//             },
//     error : function (xhr, ajaxOptions, thrownError){  
//         console.log(xhr.status);          
//         console.log(thrownError);
//     } 
// });
    //console.log(items);
     if (items.length === 0) {
      res.render('index', { files: false });
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
            console.log({array:valores});
            res.render('index', { array:valores, files: photos });  
          }); 
    //Check if files
    
    
   
});

// app.get('/image/:filename', (req, res) => {
//   console.log("entro en image");
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     // Check if the input is a valid image or not
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: 'No file exists'
//       });
//     }

//     // If the file exists then check whether it is an image
//     if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
//       // Read output to browser
//      var reader = new FileReader();
//      reader.addEventListener("loadend", function() {
//    // reader.result contains the contents of blob as a typed array
//     });
//     reader.readAsArrayBuffer(blob);

//     } else {
//       res.status(404).json({
//         err: 'Not an image'
//       });
//     }
//   });
// });


// app.get('/files/:filename', (req, res) => {

//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     // Check if file
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: 'No file exists'
//       });
//     }
//     // If File exists this will get executed
//     const readstream = gfs.createReadStream(file.filename);
//     return readstream.pipe(res);
//   });
// });




// app.get('/image/:filename', (req, res) => {
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//       const readstream = gfs.createReadStream(file.filename);
//       readstream.pipe(res);
//   });
// });

// delete function to remove the file from the database
// app.delete('/files/:id', (req, res) => {
//   gfs.remove({ _id: req.params.id, root: 'images' }, (err, gridStore) => {
//     if (err) {
//       return res.status(404).json({ err: err });
//     }

//     res.redirect('/');
//   });
// });


const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));