import mongoose, { Schema } from "mongoose";
import FileModel from "./file.model.js";

import { ErrorCodeEnum } from "../enums/error-code.enum.js";

export const STORAGE_QUOTA = 2 * 1024 * 1024 * 1024; 


const BYTE_UNIT = 1024;

export const formatBytes = (bytes)=> {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;

  while (bytes >= BYTE_UNIT && i < units.length - 1) {
    bytes /= BYTE_UNIT;
    i++;
  }



  const value = Number(bytes.toFixed(2));

  return `${value}${units[i]}`;
};

const StorageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storageQuota: {
      type: Number,
      default: STORAGE_QUOTA,
      min: [0, "Storage quota cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

StorageSchema.statics.getStorageMetrics = async function (userId) {
  const storage = await this.findOne({ userId }).lean();

  if (!storage) {
    throw new Error("Storage record not found");
  }

  const usage = await FileModel.calculateUsage(userId);

  return {
    quota: storage.storageQuota,
    usage,
    remaining: storage.storageQuota - usage,
  };
};

StorageSchema.statics.validateUpload = async function (
  userId,
  totalFileSize
) {
  if (totalFileSize < 0) {
    throw new Error("File size must be positive");
  }

  const metrics = await this.getStorageMetrics(userId);

  const hasSpace = metrics.remaining >= totalFileSize;

  if (!hasSpace) {
    const shortFall = totalFileSize - metrics.remaining;

    throw new Error(
      `Insufficient storage. ${formatBytes(shortFall)} needed.`,
      ErrorCodeEnum.INSUFFICIENT_STORAGE
    );
  }

  return {
    allowed: true,
    newUsage: metrics.usage + totalFileSize,
    remainingAfterUpload: metrics.remaining - totalFileSize,
  };
};

const StorageModel = mongoose.model("Storage", StorageSchema);

export default StorageModel;