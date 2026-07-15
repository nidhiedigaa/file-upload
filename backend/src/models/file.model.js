import mongoose from "mongoose";




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

export const UploadSourceEnum = {
  WEB: "WEB",
  API: "API",
};

const FileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    storageKey: {
      type: String,
      required: true,
      unique: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
      min: 1,
    },

    ext: {
      type: String,
      required: true,
    },

    url: {
      type: String,
    },

    uploadVia: {
      type: String,
      enum: Object.keys(UploadSourceEnum),
      required: true,
    },
  },
  {
    timestamps: true,

    toObject: {
      transform: function (doc, ret) {
        ret.formattedSize = formatBytes(ret.size);
        return ret;
      },
    },

    toJSON: {
      transform: function (doc, ret) {
        ret.formattedSize = formatBytes(ret.size);
        return ret;
      },
    },
  }
);


FileSchema.statics.calculateUsage = async function (userId) {
  const result = await this.aggregate([
    {
      $match: { userId: userId },
    },
    {
      $group: {
        _id: null,
        totalSize: {
          $sum: "$size",
        },
      },
    },
  ]);

  return result[0]?.totalSize || 0;
};


FileSchema.index({ userId: 1 });
FileSchema.index({ createdAt: -1 });

const File = mongoose.model("File", FileSchema);

export default {
  File,
  UploadSourceEnum,
};