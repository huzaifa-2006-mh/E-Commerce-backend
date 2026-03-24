const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');

const morgan = require('morgan');

dotenv.config();
connectDB();

const app = express();

const fs = require('fs');
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure uploads directory exists for remote hosting (Replit/Railway)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Serving static files (images)
app.get('/', (req, res) => res.send('API is running...'));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// For image upload route specifically
const multer = require('multer');
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  // Broad list of image types
  const filetypes = /jpg|jpeg|png|webp|jfif|avif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  console.log(`Checking file: ${file.originalname}, Ext: ${path.extname(file.originalname)}, Mime: ${file.mimetype}`);

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb('Images only! (Allowed: jpg, jpeg, png, webp, jfif)');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(500).json(err);
    } else if (err) {
      console.error('Upload Error:', err);
      return res.status(500).json({ message: err });
    }
    
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    // Return filename only if static folder is mapped to /uploads
    const normalizedPath = `/${req.file.path.replace(/\\/g, "/")}`;
    console.log('File uploaded at:', normalizedPath);
    res.send(normalizedPath);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
