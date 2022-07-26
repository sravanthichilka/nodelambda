import express from "express";
import auth from "./documents.controller";
import schema from "./documents.validator";
import { createValidator } from "express-joi-validation";
import isAccessTokenValidMiddleware from "../../middleware/multipleAccessMiddleware";
import { ENUM_User_ROLE } from "../../helper/constants";

const a = express.Router();
const validator = createValidator({
  passError: true,
});

//sprint 5
a.get(
  "/",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
    ENUM_User_ROLE.CUSTOMER_USER,
  ]),
  validator.query(schema.getDocuments),
  auth.getDocuments
);

export = a;
