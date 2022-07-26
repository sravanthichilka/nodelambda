import express from "express";
import auth from "./regions.controller";
import isAccessTokenValidMiddleware from "../../middleware/multipleAccessMiddleware";
import { ENUM_User_ROLE } from "../../helper/constants";

const a = express.Router();

//sprint 3
a.get(
  "/fetch",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
    ENUM_User_ROLE.CUSTOMER_USER,
  ]),
  auth.fetchRegionTypes
);

export = a;
