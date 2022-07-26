import express, { NextFunction, Request, Response } from "express";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { errorHandler } from "./middleware/errorHandler";
import router from "./routes";
import path from "path";
import compression from "compression";
const mongoConnection = require("./config/mongo_database");
import log from "./helper/logs";

(async function () {
  await mongoConnection.connectDB();
  log.info([mongoConnection.connectDB]);
})();

class App {
  public express;

  constructor() {
    this.express = express();
    this.express.use(compression());
    this.express.use(express.static(path.join(__dirname, "public")));
    this.express.use("/static", express.static("public"));
    this.express.set("view engine", "ejs");
    this.defaults();
  }

  private defaults(): void {
    this.express
      .use(function (req: any, res: any, next: NextFunction) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Origin,X-Requested-With,content-type,Authorization,Access-Token,Refresh-Token"
        );
        res.setHeader(
          "Access-Control-Expose-Headers",
          "Origin,X-Requested-With,content-type,Authorization,Access-Token,Refresh-Token"
        );
        req.userAgent = req.get("User-Agent");
        res.sendSucessResponse = (
          statusCode: number,
          message: string,
          data: object | undefined = undefined
        ) => {
          let _data;
          if (data) {
            _data = { ...data };
          }

          return res
            .status(statusCode)
            .send({ status_code: statusCode, message: message, data: _data });
        };

        res.sendErrorResponse = (statusCode: number, message: string, error: object) => {
          return res
            .status(statusCode)
            .send({ status_code: statusCode, message: message, ...error });
        };

        next();
      })
      .use(express.urlencoded({ extended: false }))
      .use(express.json({ type: "*/*" }))
      .use(express.raw())
      .use(router)
      .use(notFoundHandler)
      .use(errorHandler);
  }
}

export default new App().express;
