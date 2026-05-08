import multer from "multer";

// Configure storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(
      os.homedir(),
      "notes",
      req.body.courseName,
      req.body.semsterName,
      req.body.subjectName
    );

    fs.mkdirSync(uploadPath, { recursive: true }); // Create path if it doesn't exist
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // You may want to sanitize this!
  },
});

export const upload = multer({ storage });