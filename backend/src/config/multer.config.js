import multer from "multer";
import path from "path";
import fs from "fs";
import { Env } from "./env.config.js";

export const MAX_FILE_SIZE = Env.MAX_FILE_SIZE
export const MAX_FILES = Env.MAX_FILES;
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',

];



if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} not allowed`));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: MAX_FILES,
    fileSize: MAX_FILE_SIZE,
  },
});

export const multiUpload = upload.array("files", MAX_FILES);