import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Storage: keep temp files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Invalid file type"), false);
  },
});

// Middleware to convert everything → JPEG
export const convertToJpeg = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const inputPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // 🔹 Skip conversion if already JPG/JPEG
    if (ext === ".jpg" || ext === ".jpeg") {
      return next();
    }

    const outputFilename = path.parse(req.file.filename).name + ".jpg";
    const outputPath = path.join("public/images", outputFilename);

    // Convert image → JPG
    await sharp(inputPath).jpeg({ quality: 90 }).toFile(outputPath);

    // Delete original safely (async, won't block)
    fs.unlink(inputPath, (err) => {
      if (err) {
        console.warn("⚠️ Could not delete temp file:", inputPath, err.message);
      }
    });

    // 🔹 Update req.file so downstream knows about new JPG
    req.file.filename = outputFilename;
    req.file.path = outputPath;
    req.file.mimetype = "image/jpeg";

    next();
  } catch (err) {
    console.error("❌ JPEG conversion error:", err.message);
    next(err);
  }
};
