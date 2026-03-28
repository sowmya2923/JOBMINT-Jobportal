const multer = require("multer");

// Use memory storage instead of multer-gridfs-storage (which crashes on mongoose v9)
// We will manually stream the buffer to GridFSBucket in the route handler.
const storage = multer.memoryStorage();

const gridfsUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs and Images are allowed."));
    }
  },
});

module.exports = gridfsUpload;
