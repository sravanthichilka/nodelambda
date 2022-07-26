"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ejs = require("ejs");
const app_1 = __importDefault(require("../config/app"));
const data = {
    forgotpassword: {
        returnHtml: (parameters) => {
            const filePathContent = __dirname + "/design/reset.ejs";
            const compiled = ejs.compile(fs.readFileSync(filePathContent, "utf8"));
            let allParams = Object.assign({ imageLogo: app_1.default.BACKEND.BASE_URL + "/images/logo.png" }, parameters);
            return compiled(allParams);
        },
        subject: "Birko - Reset Password",
    },
    setTemporaryPassword: {
        returnHtml: (parameters) => {
            const filePathContent = __dirname + "/design/set-temporary-password.ejs";
            const compiled = ejs.compile(fs.readFileSync(filePathContent, "utf8"));
            let allParams = Object.assign({ imageLogo: app_1.default.BACKEND.BASE_URL + "/images/logo.png" }, parameters);
            return compiled(allParams);
        },
        subject: "Birko - Reset Password",
    },
    welcomeEmail: {
        returnHtml: (parameters) => {
            const filePathContent = __dirname + "/design/account-setup.ejs";
            const compiled = ejs.compile(fs.readFileSync(filePathContent, "utf8"));
            let allParams = Object.assign({ imageLogo: app_1.default.BACKEND.BASE_URL + "/images/logo.png" }, parameters);
            return compiled(allParams);
        },
        subject: "Birko - Verify Account",
    },
};
exports.default = data;
