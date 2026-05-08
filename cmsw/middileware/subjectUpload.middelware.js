import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "cms-icon";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    // use subject name (replace spaces with underscores)
    const safeName = req.body.name
      ? req.body.name.replace(/\s+/g, "_")
      : "subject";

    cb(null, `${safeName}${ext}`);
  },
});

const uploadSubject = multer({ storage });

export default uploadSubject;
