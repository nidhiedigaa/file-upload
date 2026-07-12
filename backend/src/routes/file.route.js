import { Router } from "express";
import { multiUpload } from "../config/multer.config.js";
import {
  deleteFilesController,
  downloadFilesController,
  getAllFilesController,
  uploadFilesViaWebController,
} from "../controllers/files.controller.js";
import { CheckStorageAvailability } from "../middlewares/check-storage.middleware.js";

const filesRoutes = Router();

// Upload files
filesRoutes.post(
  "/upload",
  multiUpload,
  CheckStorageAvailability,
  uploadFilesViaWebController
);

// Download files
filesRoutes.post("/download", downloadFilesController);

// Get all uploaded files
filesRoutes.get("/all", getAllFilesController);

// Delete multiple files
filesRoutes.delete("/bulk-delete", deleteFilesController);

export default filesRoutes;