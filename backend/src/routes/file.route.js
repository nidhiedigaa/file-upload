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


filesRoutes.post(
  "/upload",
  multiUpload,
  CheckStorageAvailability,
  uploadFilesViaWebController
);


filesRoutes.post("/download", downloadFilesController);


filesRoutes.get("/all", getAllFilesController);


filesRoutes.delete("/delete-all", deleteFilesController);

export default filesRoutes;