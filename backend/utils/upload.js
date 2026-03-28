const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,

  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB

  fileFilter: function (req, file, cb) {

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpg",
      "image/jpeg"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Image files are allowed!"));
    }

  },
});

module.exports = upload;