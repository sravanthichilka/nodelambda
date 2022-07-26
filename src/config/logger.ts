import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

/**
 * Ref link : https://www.npmjs.com/package/winston-daily-rotate-file
 * Ref link 2 : https://medium.com/@akshaypawar911/how-to-use-winston-daily-rotate-file-logger-in-nodejs-1e1996d2d38
 * Ref link 3 : https://www.npmjs.com/package/s3-streamlogger
 *
 */
const logFormat = winston.format.combine(
  // winston.format.splat(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => `${info.timestamp} - ${info.level}: ${info.message}`)
);

const transport = new DailyRotateFile({
  filename: <any>"logs/birko-api-%DATE%",
  datePattern: "YYYY-MM-DD",
  extension: ".log",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "20d",
  utc: true,
});

transport.on("rotate", function (oldFilename, newFilename) {});

const logger = winston.createLogger({
  format: logFormat,
  transports: [transport],
});

export default logger;
