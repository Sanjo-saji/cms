import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "cms-student";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const regNumber = req.body.register; // must be in request body
    const ext = path.extname(file.originalname); // keep original extension
    cb(null, `${regNumber}${ext}`);
  },
});

const StudentUpload = multer({ storage });

export default StudentUpload;
