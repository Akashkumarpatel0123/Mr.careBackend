const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/kyc';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });
module.exports = upload;
