import { v4 as uuidv4 } from 'uuid';
import FileModel, { UploadSourceEnum } from '../models/file.model.js';
import UserModel from '../models/user.model.js';
import alterFileName from '../utis/helper.js';

import { Env } from '../config/env.config.js';


export const uploadFilesService = async (userId, files, uploadedVia) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error("Unauthorized access");
  }

  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const results = await Promise.allSettled(
    files.map(async (file) => {
      try {
        const createdFile = await FileModel.create({
          userId,
          storageKey: file.filename, 
          originalName: file.originalname,
          uploadVia: uploadedVia,
          size: file.size,
          ext: path.extname(file.originalname).slice(1).toLowerCase(),
          url: "",
          mimeType: file.mimetype,
          filePath: file.path, 
        });

        return {
          fileId: createdFile._id,
          originalName: createdFile.originalName,
          size: createdFile.size,
          ext: createdFile.ext,
          mimeType: createdFile.mimeType,
        };
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    })
  );

  const successfulRes = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  const failedRes = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason.message);

  if (failedRes.length > 0) {
    console.log("Failed to upload files:", failedRes);
  }

  return {
    message: `Uploaded successfully ${successfulRes.length} out of ${files.length} files`,
    data: successfulRes,
    failedCount: failedRes.length,
  };
};

export const getAllFilesService = async (userId, filter, pagination) => {
  const { keyword } = filter;

  const filterConditions = {
    userId,
  };

  if (keyword) {
    filterConditions.$or = [
      {
        originalName: {
          $regex: keyword,
          $options: "i",
        },
      },
    ];
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [files, totalCount] = await Promise.all([
    FileModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),

    FileModel.countDocuments(filterConditions),
  ]);

  const filesWithUrls = files.map((file) => {
    return {
      ...file.toObject(),
      url: `http://localhost:8000/uploads/${file.storageKey}`,
    };
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    files: filesWithUrls,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};
import { PassThrough, Readable } from 'stream';
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import archiver from "archiver";


export const getFileUrlService = async (fileId) => {
  const file = await FileModel.findById(fileId);

  if (!file) {
    throw new Error("File not found");
  }

  return {
    url: `http://localhost:8000/uploads/${file.storageKey}`,
    contentType: file.mimeType,
    fileSize: file.size,
  };
};

export const deleteFilesService = async (userId, fileIds) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const files = await FileModel.find({
        _id: { $in: fileIds },
        userId,
      }).session(session);

      if (!files.length) {
        throw new Error("No files found");
      }

      const failedFiles = [];

      await Promise.all(
        files.map(async (file) => {
          try {
            const filePath = path.join(
              process.cwd(),
              "uploads",
              file.storageKey
            );

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.error("Failed deleting:", file.storageKey);
            failedFiles.push(file.storageKey);
          }
        })
      );

      const successfulFileIds = files
        .filter((file) => !failedFiles.includes(file.storageKey))
        .map((file) => file._id);

      const { deletedCount } = await FileModel.deleteMany({
        _id: { $in: successfulFileIds },
        userId,
      }).session(session);

      result = {
        deletedCount,
        failedCount: failedFiles.length,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

export const downloadFilesService = async (userId, fileIds) => {
  const files = await FileModel.find({
    _id: { $in: fileIds },
    userId,
  });

  if (!files.length) {
    throw new Error("No files found");
  }


  if (files.length === 1) {
    return {
      url: `http://localhost:5000/uploads/${files[0].storageKey}`,
      isZip: false,
    };
  }


  const url = await handleMultipleFilesDownload(files, userId);

  return {
    url,
    isZip: true,
  };
};

async function handleMultipleFilesDownload(files, userId) {
  const timestamp = Date.now();

  const zipName = `download-${timestamp}.zip`;

  const zipPath = path.join(process.cwd(), "uploads", zipName);

  const output = fs.createWriteStream(zipPath);

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.pipe(output);

  for (const file of files) {
    const filePath = path.join(
      process.cwd(),
      "uploads",
      file.storageKey
    );

    archive.file(filePath, {
      name: file.originalName,
    });
  }

  await archive.finalize();

  return `http://localhost:5000/uploads/${zipName}`;
}