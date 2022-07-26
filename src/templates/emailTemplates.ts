const fs = require("fs");
const ejs = require("ejs");
import { stringMap } from "aws-sdk/clients/backup";
import config from "../config/app";

const data = {
  forgotpassword: {
    returnHtml: (parameters: { firstName: string; resetLink: string }) => {
      const filePathContent = __dirname + "/design/reset.ejs";
      const compiled = ejs.compile(fs.readFileSync(filePathContent, "utf8"));
      let allParams = { imageLogo: config.BACKEND.BASE_URL + "/images/logo.png", ...parameters };
      return compiled(allParams);
    },
    subject: "Birko - Reset Password",
  },
  setTemporaryPassword: {
    returnHtml: (parameters: {
      websiteLink: string;
      firstName: string;
      userEmail: string;
      temporaryPassword: string;
    }) => {
      const filePathContent = __dirname + "/design/set-temporary-password.ejs";
      const compiled = ejs.compile(fs.readFileSync(filePathContent, "utf8"));
      let allParams = { imageLogo: config.BACKEND.BASE_URL + "/images/logo.png", ...parameters };
      return compiled(allParams);
    },
    subject: "Birko - Reset Password",
  },
  welcomeEmail: {
    returnHtml: (parameters: {
      websiteLink: string;
      firstName: string;
      userEmail: string;
      temporaryPassword: string;
    }) => {
      const filePathContent = __dirname + "/design/account-setup.ejs";
      const compiled = ejs.compile(fs.readFileSync(filePathContent, "utf8"));
      let allParams = { imageLogo: config.BACKEND.BASE_URL + "/images/logo.png", ...parameters };
      return compiled(allParams);
    },
    subject: "Birko - Verify Account",
  },
};
export default data;
