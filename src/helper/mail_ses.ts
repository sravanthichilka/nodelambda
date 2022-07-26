import config from "../config/app";
import log from "./logs";
import AWS from "aws-sdk";

new AWS.Config({
  accessKeyId: config.MAIL.SES_USERNAME,
  secretAccessKey: config.MAIL.SES_PASSWORD,
  region: config.MAIL.SES_AWS_REGION,
});

AWS.config.update({
  apiVersion: "2010-12-01",
  region: config.MAIL.SES_AWS_REGION,
});

const SESConfig = {
  apiVersion: "2019",
};

export function sendEmail(to: string[], subject: string, html: string) {
  const params: any = {
    Source: config.MAIL.SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: to,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
  };
  return new AWS.SES(SESConfig).sendEmail(params).promise();
}
