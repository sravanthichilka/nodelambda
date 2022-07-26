"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const app_1 = __importDefault(require("../config/app"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
new aws_sdk_1.default.Config({
    accessKeyId: app_1.default.MAIL.SES_USERNAME,
    secretAccessKey: app_1.default.MAIL.SES_PASSWORD,
    region: app_1.default.MAIL.SES_AWS_REGION,
});
aws_sdk_1.default.config.update({
    apiVersion: "2010-12-01",
    region: app_1.default.MAIL.SES_AWS_REGION,
});
const SESConfig = {
    apiVersion: "2019",
};
function sendEmail(to, subject, html) {
    const params = {
        Source: app_1.default.MAIL.SES_SENDER_EMAIL,
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
    return new aws_sdk_1.default.SES(SESConfig).sendEmail(params).promise();
}
exports.sendEmail = sendEmail;
