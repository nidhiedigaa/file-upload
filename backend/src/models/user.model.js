import mongoose from "mongoose";
import { hashValue,compareValue } from "../utis/bcrypt.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
    },

    profilePicture: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


userSchema.pre("save", async function (next) {
  
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }

  next();
});


userSchema.methods.comparePassword = async function (password) {
  return await compareValue(password, this.password);
};


userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User