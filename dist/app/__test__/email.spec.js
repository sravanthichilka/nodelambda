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
const app_1 = __importDefault(require("../../config/app"));
const chai_1 = require("chai");
const mail_ses_1 = require("../../helper/mail_ses");
const emailTemplates_1 = __importDefault(require("../../templates/emailTemplates"));
describe("Email Suit", () => {
    const emailSendTo = "testemail@yopmail.com";
    it("sync forgotpassword Email", () => __awaiter(void 0, void 0, void 0, function* () {
        let resetLink = app_1.default.web.LINK + "/" + app_1.default.web.RESET_PASSWORD_LINK + "?token=" + "SDFGFSDFGSDFGSFGSDGSD";
        const websiteLink = app_1.default.web.LINK;
        const forgotpasswordData = { firstName: "annapurna", lastName: "kenguva", resetLink };
        const forgotMailResponse = yield mail_ses_1.sendEmail([emailSendTo], emailTemplates_1.default.forgotpassword.subject, emailTemplates_1.default.forgotpassword.returnHtml({
            firstName: forgotpasswordData.firstName,
            resetLink: forgotpasswordData.resetLink,
        }));
        chai_1.expect(forgotMailResponse).to.have.property("MessageId");
        chai_1.expect(forgotMailResponse.ResponseMetadata).to.have.property("RequestId");
    }));
    it("async forgotpassword Email", () => __awaiter(void 0, void 0, void 0, function* () {
        let resetLink = app_1.default.web.LINK + "/" + app_1.default.web.RESET_PASSWORD_LINK + "?token=" + "SDFGFSDFGSDFGSFGSDGSD";
        const websiteLink = app_1.default.web.LINK;
        const forgotpasswordData = { firstName: "annapurna", lastName: "kenguva", resetLink };
        mail_ses_1.sendEmail([emailSendTo], emailTemplates_1.default.forgotpassword.subject, emailTemplates_1.default.forgotpassword.returnHtml({
            firstName: forgotpasswordData.firstName,
            resetLink: forgotpasswordData.resetLink,
        }));
    }));
    it("sync setTemporary Email", () => __awaiter(void 0, void 0, void 0, function* () {
        const websiteLink = app_1.default.web.LINK;
        const mailSetTemporaryPasswordData = {
            websiteLink: websiteLink,
            firstName: "annapurna",
            userEmail: emailSendTo,
            temporaryPassword: "testing1234",
        };
        const setTemporaryMailResponse = (yield mail_ses_1.sendEmail([emailSendTo], emailTemplates_1.default.setTemporaryPassword.subject, emailTemplates_1.default.setTemporaryPassword.returnHtml(mailSetTemporaryPasswordData)));
        chai_1.expect(setTemporaryMailResponse).to.have.property("MessageId");
        chai_1.expect(setTemporaryMailResponse.ResponseMetadata).to.have.property("RequestId");
    }));
    it("async setTemporary Email", () => __awaiter(void 0, void 0, void 0, function* () {
        const websiteLink = app_1.default.web.LINK;
        const mailSetTemporaryPasswordData = {
            websiteLink: websiteLink,
            firstName: "annapurna",
            userEmail: emailSendTo,
            temporaryPassword: "testing1234",
        };
        mail_ses_1.sendEmail([emailSendTo], emailTemplates_1.default.setTemporaryPassword.subject, emailTemplates_1.default.setTemporaryPassword.returnHtml(mailSetTemporaryPasswordData));
    }));
    it("sync Welcome Email", () => __awaiter(void 0, void 0, void 0, function* () {
        const websiteLink = app_1.default.web.LINK;
        const mailWelcomeData = {
            websiteLink: websiteLink,
            firstName: "annapurna",
            userEmail: emailSendTo,
            temporaryPassword: "testing1234",
        };
        const welcomeMailResponse = (yield mail_ses_1.sendEmail([emailSendTo], emailTemplates_1.default.welcomeEmail.subject, emailTemplates_1.default.welcomeEmail.returnHtml(mailWelcomeData)));
        chai_1.expect(welcomeMailResponse).to.have.property("MessageId");
        chai_1.expect(welcomeMailResponse.ResponseMetadata).to.have.property("RequestId");
    }));
    it("async Welcome Email", () => __awaiter(void 0, void 0, void 0, function* () {
        const websiteLink = app_1.default.web.LINK;
        const mailWelcomeData = {
            websiteLink: websiteLink,
            firstName: "annapurna",
            userEmail: emailSendTo,
            temporaryPassword: "testing1234",
        };
        mail_ses_1.sendEmail([emailSendTo], emailTemplates_1.default.welcomeEmail.subject, emailTemplates_1.default.welcomeEmail.returnHtml(mailWelcomeData));
    }));
});
