const express = require('express');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const multer = require('multer');
const path = require('path');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const app = express();


const mongoURI = 'mongodb://0.0.0.0:27017/ImageChunk';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const conn = mongoose.connection;
// Createing GridFS stream for handling file chunks
conn.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db);
  gfs = Grid(conn.db, mongoose.mongo);
});

// Multer middleware for handling file uploads
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = "file" + path.extname(file.originalname);
      const fileInfo = {
        filename: filename,
        bucketName: 'fs' 
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({ storage });


// Route for handling image upload
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    res.status(201).json({ message: 'Image uploaded successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image.' });
  }
});
// GET route for fetching the image by filename
app.get('/image/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const readStream = await gridfsBucket.openDownloadStream(new mongoose.Types.ObjectId(filename));
    res.set('Content-Type', 'image/jpeg'); 
    readStream.pipe(res); 
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch image.' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});