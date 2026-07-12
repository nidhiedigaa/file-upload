import mongoose, { Schema } from "mongoose";

const ApiKeySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    displayKey: {
      type: String,
      required: true,
    },
    hashedKey: {
      type: String,
      required: true,
      select: false,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ApiKeySchema.statics.updateLastUsedAt = async function (hashedKey) {
  await this.updateOne(
    { hashedKey },
    { lastUsedAt: new Date() }
  );
};

const ApiKeyModel = mongoose.model("ApiKey", ApiKeySchema);

export default ApiKeyModel;