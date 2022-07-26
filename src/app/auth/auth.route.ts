import express from "express";
import auth from "./auth.controller";
import schema from "./auth.validator";
import isAccessTokenValidMiddleware from "../../middleware/multipleAccessMiddleware";
import { createValidator } from "express-joi-validation";
import { ENUM_User_ROLE } from "../../helper/constants";
const a = express.Router();
const validator = createValidator({
  passError: true,
});

a.post("/login", validator.body(schema.login), auth.login);
a.post("/forgotPassword", validator.body(schema.forgotPassword), auth.forgotPassword);
a.post("/resetPassword", validator.body(schema.resetPassword), auth.resetPassword);
a.post("/refreshToken", validator.body(schema.refreshToken), auth.updateRefreshToken);
a.post(
  "/logout",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
    ENUM_User_ROLE.CUSTOMER_USER,
  ]),
  validator.body(schema.logout),
  auth.logout
);

export = a;
