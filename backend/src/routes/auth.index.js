import authRoutes from "./auth.route.js";
import { Router } from "express";
import filesRoutes from "./file.route.js";
import { passportAuthenticateJwt } from "../config/passport.config.js";


const internalAuthRoutes=Router()
internalAuthRoutes.use('/auth',authRoutes)
internalAuthRoutes.use('/files', passportAuthenticateJwt, filesRoutes);

export default internalAuthRoutes


