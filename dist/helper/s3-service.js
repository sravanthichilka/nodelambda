"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.moveAndDeleteFile = exports.createCloudFrontPresigned = exports.createPresignedPost = void 0;
const aws_sdk_1 = __importStar(require("aws-sdk"));
const path = require("path");
const app_1 = __importDefault(require("../config/app"));
const logs_1 = __importDefault(require("../helper/logs"));
const constants_1 = require("./constants");
const awsObj = {
    apiVersion: "2019",
    region: app_1.default.MAIL.SES_AWS_REGION,
};
if (app_1.default.app.ENVIRONMENT === constants_1.APP_ENVIRONMENT.LOCAL) {
    awsObj.accessKeyId = app_1.default.MAIL.SES_ACCESS_KEY;
    awsObj.secretAccessKey = app_1.default.MAIL.SES_SECRET_KEY;
}
const s3 = new aws_sdk_1.default.S3(awsObj);
const createPresignedPost = (param) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                s3.createPresignedPost(param, (err, data) => {
                    if (err)
                        return reject(err);
                    return resolve(data);
                });
            }
            catch (error) {
                return reject(error);
            }
        });
    });
});
exports.createPresignedPost = createPresignedPost;
const createCloudFrontPresigned = (key) => __awaiter(void 0, void 0, void 0, function* () {
    // https://abc.cloudfront.net/my-resource.jpg
    const url = app_1.default.S3.CLOUDFRONT_URL_TEST + key;
    const signer = new aws_sdk_1.CloudFront.Signer(app_1.default.S3.AWS_CLOUDFRONT_ACCESSKEY || "", app_1.default.S3.AWS_CLOUDFRONT_PK || "");
    // Setup expiration time (five min in the future, in this case)
    const expiration = new Date();
    const cloudFrontExpireTime = app_1.default.S3.CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND;
    expiration.setTime(expiration.getTime() + cloudFrontExpireTime);
    const expirationEpoch = expiration.valueOf();
    // Set options (Without policy in this example, but a JSON policy string can be substituted)
    const options = {
        url: url,
        expires: expirationEpoch,
    };
    return new Promise((resolve, reject) => {
        // Call getSignedUrl passing in options, to be handled either by callback or synchronously without callback
        signer.getSignedUrl(options, (err, url) => {
            if (err) {
                reject(err);
            }
            resolve(url);
        });
    });
});
exports.createCloudFrontPresigned = createCloudFrontPresigned;
const moveAndDeleteFile = (inputKeyName, targetKeyName) => __awaiter(void 0, void 0, void 0, function* () {
    const copyparams = {
        Bucket: app_1.default.S3.AWS_BUCKET_NAME,
        CopySource: app_1.default.S3.AWS_BUCKET_NAME + "/" + inputKeyName,
        Key: targetKeyName,
    };
    const deleteparams = {
        Bucket: app_1.default.S3.AWS_BUCKET_NAME,
        Key: inputKeyName,
    };
    return new Promise((resolve, reject) => {
        s3.copyObject(copyparams, function (copyErr, copyData) {
            if (copyErr) {
                logs_1.default.info(["moveAndDeleteFile:copyObject", copyErr]);
                return reject(false);
            }
            else {
                s3.deleteObject(deleteparams, function (copyDeleteErr, copyData_) {
                    if (copyDeleteErr) {
                        logs_1.default.info(["moveAndDeleteFile:deleteObject", copyDeleteErr]);
                        return reject(false);
                    }
                    else {
                        logs_1.default.info(["Successfully copied the item........."]);
                        return resolve(true);
                    }
                });
            }
        });
    });
});
exports.moveAndDeleteFile = moveAndDeleteFile;
