"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipleDownload = void 0;
const app_1 = __importDefault(require("../config/app"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
new aws_sdk_1.default.Config({
    accessKeyId: app_1.default.MAIL.SES_ACCESS_KEY,
    secretAccessKey: app_1.default.MAIL.SES_SECRET_KEY,
    region: app_1.default.MAIL.SES_AWS_REGION,
});
aws_sdk_1.default.config.update({
    apiVersion: "2015-03-31",
    region: app_1.default.MAIL.SES_AWS_REGION,
});
const multipleDownload = (keysNameList) => __awaiter(void 0, void 0, void 0, function* () {
    const region = app_1.default.MAIL.SES_AWS_REGION;
    const bucket = app_1.default.S3.AWS_BUCKET_NAME;
    const folder = "13";
    const lambda = new aws_sdk_1.default.Lambda();
    const milliseconds = new Date().getTime();
    const fileName = "birkocorp-" + milliseconds + ".zip";
    const files = keysNameList;
    const payload = JSON.stringify({
        region: region,
        bucket: bucket,
        folder: folder,
        files: files,
        zipFileName: "download/" + fileName,
        accessKeyId: app_1.default.MAIL.SES_ACCESS_KEY,
        secretAccessKey: app_1.default.MAIL.SES_SECRET_KEY,
    });
    const params = {
        FunctionName: "downloadMultipleFiles",
        Payload: payload,
    };
    return yield lambda.invoke(params).promise();
});
exports.multipleDownload = multipleDownload;
