import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { Env } from "./env.config.js";
import { findByIdUserService } from "../services/user.service.js";

const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.accessToken;
  }

  return null;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: Env.JWT_SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      if (!payload.userId) {
        return done(null, false);
      }

      const user = await findByIdUserService(payload.userId);

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});