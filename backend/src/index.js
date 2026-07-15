import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import "./config/passport.config.js"
import cookieParser from "cookie-parser"
import { Env } from "./config/env.config.js";
import { connectDatabase,disconnectDatabase } from "./config/database.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import internalAuthRoutes from "./routes/auth.index.js";


const app = express();


const allowedOrigins = Env.ALLOWED_ORIGINS
  ? Env.ALLOWED_ORIGINS.split(",")
  : [];

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: Origin ${origin} is not allowed`));
    }
  },
};

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(passport.initialize());
app.use(`${Env.BASE_PATH}`,internalAuthRoutes)

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello Welcome",
  });
});

app.use(errorHandler);



async function startServer() {
  try {
    await connectDatabase()
    const server = app.listen(Env.PORT, () => {
      console.log(
        `Server listening on port ${Env.PORT} in ${Env.NODE_ENV} mode`,
      );
    });

    const shutdownSignals = ['SIGTERM', 'SIGINT'];

    shutdownSignals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`${signal} recieved: shutting down gracefully`);

        try {
          server.close(() => {
            console.log('HTTP server closed');
          });
         
          await disconnectDatabase()
          process.exit(0);
        } catch (error) {
          console.log(`Error occured during shutting down`, error);
          process.exit(1);
        }
      });
    });
  } catch (error) {
    console.log(`Failed to start server`, error);
    process.exit(1);
  }
}

startServer();