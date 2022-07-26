import express from "express";
import teammemberController from "./teammembers.controller";
import schema from "./teammembers.validator";
import { createValidator } from "express-joi-validation";
import { ENUM_User_ROLE } from "../../helper/constants";
import isAccessTokenValidMiddleware from "../../middleware/multipleAccessMiddleware";

const a = express.Router();
const validator = createValidator({
  passError: true,
});

a.get(
  "/fetch",
  isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN]),
  validator.query(schema.teamMemberList),
  teammemberController.fetchTeamMember
);

export = a;
