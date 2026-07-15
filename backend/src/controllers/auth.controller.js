import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { loginService, registerService } from "../services/auth.service.js";
import User from "../models/user.model.js";

export const registerController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);

  await registerService(body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User created successfully",
  });
});


export const loginController = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);

  const result = await loginService(body);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: result.expiresAt-Date.now(), 
  });

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User logged in successfully",
    expiresAt:result.expiresAt,
    user:result.user
  });
});

