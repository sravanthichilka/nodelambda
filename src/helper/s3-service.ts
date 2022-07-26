import AWS, { CloudFront } from "aws-sdk";
const path = require("path");
import config from "../config/app";
import log from "../helper/logs";
import { APP_ENVIRONMENT } from "./constants";

const awsObj: {
  apiVersion: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
} = <{ apiVersion: string; region: string; accessKeyId?: string; secretAccessKey?: string }>{
  apiVersion: "2019",
  region: config.MAIL.SES_AWS_REGION,
};

if (config.app.ENVIRONMENT === APP_ENVIRONMENT.LOCAL) {
  awsObj.accessKeyId = config.MAIL.SES_ACCESS_KEY;
  awsObj.secretAccessKey = config.MAIL.SES_SECRET_KEY;
}

const s3 = new AWS.S3(awsObj);

export const createPresignedPost = async (param: Object) => {
  return new Promise(async function (resolve, reject) {
    try {
      s3.createPresignedPost(param, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    } catch (error) {
      return reject(error);
    }
  });
};

export const createCloudFrontPresigned = async (key: any) => {
  // https://abc.cloudfront.net/my-resource.jpg
  const url = config.S3.CLOUDFRONT_URL_TEST + key;

  const signer = new CloudFront.Signer(
    config.S3.AWS_CLOUDFRONT_ACCESSKEY || "",
    config.S3.AWS_CLOUDFRONT_PK || ""
  );

  // Setup expiration time (five min in the future, in this case)
  const expiration = new Date();
  const cloudFrontExpireTime = config.S3.CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND;
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
};

export const moveAndDeleteFile = async (inputKeyName: string, targetKeyName: string) => {
  const copyparams = {
    Bucket: config.S3.AWS_BUCKET_NAME,
    CopySource: config.S3.AWS_BUCKET_NAME + "/" + inputKeyName,
    Key: targetKeyName,
  };
  const deleteparams = {
    Bucket: config.S3.AWS_BUCKET_NAME,
    Key: inputKeyName,
  };

  return new Promise((resolve, reject) => {
    s3.copyObject(copyparams, function (copyErr, copyData) {
      if (copyErr) {
        log.info(["moveAndDeleteFile:copyObject", copyErr]);
        return reject(false);
      } else {
        s3.deleteObject(deleteparams, function (copyDeleteErr, copyData_) {
          if (copyDeleteErr) {
            log.info(["moveAndDeleteFile:deleteObject", copyDeleteErr]);
            return reject(false);
          } else {
            log.info(["Successfully copied the item........."]);
            return resolve(true);
          }
        });
      }
    });
  });
};
