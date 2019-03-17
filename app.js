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
var FormData = require('form-data');
// Middleware
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
var fs = require('fs');
const Resize = require('./public/js/Resize');
var im = require('imagemagick');
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

app.post('/upload',upload.single('fileToUpload'), (req, res) => {
  console.log("entro");
   var collection = conn.db.collection('recipe');
           collection.insertOne({"Image":req.file,"Ingredientes": req.body.IngredientesUp,
             "Nombre": req.body.NameUp,//string
             "Proceso": req.body.RecetaUp});
  res.redirect('/');
});

app.get('/', (req, res) => {
  var collection = conn.db.collection('recipe');
  collection.find().toArray((err, items) => {
    console.log(items.length);
    //console.log(items);
     if (items.length === 0) {
      res.render('index', { files: false });
    } else {
      console.log(items[1]);
       res.render('index', { files: items });     
  }
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