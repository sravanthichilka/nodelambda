import config from "../config/app";

import AWS from "aws-sdk";

new AWS.Config({
  accessKeyId: config.MAIL.SES_ACCESS_KEY,
  secretAccessKey: config.MAIL.SES_SECRET_KEY,
  region: config.MAIL.SES_AWS_REGION,
});

AWS.config.update({
  apiVersion: "2015-03-31",
  region: config.MAIL.SES_AWS_REGION,
});

interface LambdaInterface {
  key: string;
  newKeyName: string;
}

export const multipleDownload = async (keysNameList: LambdaInterface[]) => {
  const region = config.MAIL.SES_AWS_REGION;
  const bucket = config.S3.AWS_BUCKET_NAME;
  const folder = "13";

  const lambda = new AWS.Lambda();

  const milliseconds = new Date().getTime();
  const fileName = "birkocorp-" + milliseconds + ".zip";

  const files = keysNameList;
  const payload = JSON.stringify({
    region: region,
    bucket: bucket,
    folder: folder,
    files: files,
    zipFileName: "download/" + fileName,
    accessKeyId: config.MAIL.SES_ACCESS_KEY,
    secretAccessKey: config.MAIL.SES_SECRET_KEY,
  });

  const params = {
    FunctionName: "downloadMultipleFiles",
    Payload: payload,
  };

  return await lambda.invoke(params).promise();
};
