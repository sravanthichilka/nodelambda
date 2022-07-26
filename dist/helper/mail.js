"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const sgMail = require("@sendgrid/mail");
const app_1 = __importDefault(require("../config/app"));
const logs_1 = __importDefault(require("./logs"));
/**
 * Ref link : https://github.com/sendgrid/sendgrid-nodejs/blob/main/test/typescript/mail.ts
 * Ref link2: https://www.npmjs.com/package/@sendgrid/mail
 */
function sendEmail(mail) {
    var content = {};
    content.from = app_1.default.sendgrid.FROM_MAIL;
    content.to = mail.to;
    content.subject = mail.subject;
    // content.html = mail.html;
    if (mail.cc) {
        content.cc = mail.cc;
    }
    if (mail.bcc) {
        content.bcc = mail.bcc;
    }
    if (mail.categories) {
        content.categories = mail.categories;
    }
    if (mail.attachments) {
        content.attachments = mail.attachments;
    }
    if (mail.headers) {
        content.headers = mail.headers;
    }
    if (mail.templateId) {
        content.templateId = mail.templateId;
        content.dynamicTemplateData = mail.dynamicTemplateData;
    }
    // Mail sending....
    sgMail.setApiKey(app_1.default.sendgrid.API_KEY);
    sgMail.send(content).then((result) => {
        delete content.attachments;
        logs_1.default.info(['Mail content', content]);
        logs_1.default.info(['Success Sent email', result]);
    }, (err) => {
        delete content.attachments;
        logs_1.default.info(['Mail content', content]);
        logs_1.default.error(['Error on Mail sent', err]);
    });
}
exports.sendEmail = sendEmail;
