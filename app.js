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
  gfs = Grid(conn.db, mongoose.mongo);  
  gfs.collection('recipe');
});

// Create storage engine
// const storage = new GridFsStorage({
//   url: mongoURI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//         const filename = file.originalname;
//         const fileInfo = {
//           filename: filename,
//           bucketName: 'images'
//         };
//         resolve(fileInfo);
//     });
//   }
// });
//Create storage engine
var id= new mongoose.Types.ObjectId();
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'recipe',
          _id: id
        };
        resolve(fileInfo);
    });
  }
});



const UPLOAD_PATH = 'uploads';

//const upload = multer({ storage });
const upload = multer();

// app.post('/resize', (req, res) => {
//    var ingredientes=req.param('IngredientesUp', null);
//    console.log(ingredientes);
//         var nombre=req.param('NameUp', null);
//         var proceso=req.param('RecetaUp', null);
//         var fileName="image";
//         //var reader = new FileReader();
//         // if (fileName) {
//         // // create reader
            
            
//         //     reader.onload = function(e) {
//         //     // browser completed reading file - display it
//         //         alert(e.target.result);
//         //     };
//         // }
//         console.log(req.param('fileToUpload', null));
//         Jimp.read(req.param('fileToUpload', null), (err, file) => {
//         if (err) throw err;
//             file.resize(Jimp.AUTO, 100) // resize
//             file.write(fileName); // save
            
//         });
//         var data ={'imageUP': fs.createReadStream(fileName),'IngredientesUp':req.param('IngredientesUp', null),'NameUp':req.param('NameUp', null),'RecetaUp':req.param('RecetaUp', null)};

        
//         // formData.append('imageUP', fs.createReadStream(fileName));
//         // formData.append('IngredientesUp',req.param('IngredientesUp', null));
//         // formData.append('NameUp',req.param('NameUp', null));
//         // formData.append('RecetaUp',req.param('RecetaUp', null));
//         //  $.ajax({
//         //     type: 'POST',
//         //     url: '/upload',
//         //     formData: data,
//         //     success: function (data) {
                
//         //     }
//         // });
//         res.redirect('/upload');
//     });



app.post('/upload',upload.single('fileToUpload'), (req, res) => {
  console.log("entro");
  //console.log(req);
  //file = req.param('fileToUpload', null);
   // var Imagedata = resizeImage.resize(req.file, 50, 50, resizeImage.PNG);
    //console.log(Imagedata);
    //upload.single(Imagedata)
	
   var collection = conn.db.collection('recipe');
           collection.insertOne({"Image":req.file,"Ingredientes": req.body.IngredientesUp,
             "Nombre": req.body.NameUp,//string
             "Proceso": req.body.RecetaUp});    
    
  id= new mongoose.Types.ObjectId();

  res.redirect('/');
});

app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    //Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
       res.render('index', { files: files });
     }
  });
});

app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // If File exists this will get executed
    const readstream = gfs.createReadStream(file.filename);
    return readstream.pipe(res);
  });
});




app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if the input is a valid image or not
    //if (!file || file.length === 0) {
      //return res.status(404).json({
        //err: 'No file exists'
      //});
    //}

    // If the file exists then check whether it is an image
    //if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    //} else {
      //res.status(404).json({
        //err: 'Not an image'
      
    
  });
});

// delete function to remove the file from the database
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'images' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});


const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));