import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import StorageModel from "../models/storage.model.js";

import { signJwtToken } from "../utis/jwt.js";

export const registerService = async (body) => {
  const { email } = body;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);

      if (existingUser) {
        throw new Error("User already exists");
      }

      const newUser = new UserModel({
        ...body,
        profilePicture: body.profilePicture || null,
      });

      await newUser.save({ session });

      const storage = new StorageModel({
        userId: newUser._id,
      });

      await storage.save({ session });

      return {
        user: newUser.omitPassword(),
      };
    });
  } catch (error) {
    console.error("Error registering user", error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const loginService = async (body) => {
  const { email, password } = body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new Error("Email/Password not found");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error("Email/Password is incorrect");
  }

  const { token, expiresAt } = signJwtToken({
    userId: user.id,
  });

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
  };
};