import StorageModel from "../models/storage.model.js";


export const CheckStorageAvailability = async (req, res, next) => {
  try {
   
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      throw new Error("No file uploaded");
    }


    const userId = req.user?._id;

    if (!userId) {
      throw new Error("Unauthorized access");
    }

    
    const totalFileSize = files.reduce((sum, file) => {
      return sum + file.size;
    }, 0);

    
    const result = await StorageModel.validateUpload(
      userId,
      totalFileSize
    );

    console.log(`Storage result: ${JSON.stringify(result)}`);

    next();
  } catch (error) {
    next(error);
  }
};