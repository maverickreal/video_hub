const multer = require('multer'),
        path = require('path'),
 {v4 : uuid} = require('uuid'),
          fs = require('fs');

const set = new Set(['video/mp4', 'video/webm', 'video/avi', 'video/mkv']);

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    const uploadDir = path.join(__dirname, '../../../uploads/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb)=>{
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (set.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Valid type of file not provided with.'));
  }
};

const upload = multer({ storage, fileFilter, limits: {
  fileSize : 50 * 1024 * 1024
}});

module.exports = upload;