import express from "express";
import auth from "./users.controller";
import schema from "./users.validator";
import { createValidator } from "express-joi-validation";
import { ENUM_User_ROLE } from "../../helper/constants";
import isAccessTokenValidMiddleware from "../../middleware/multipleAccessMiddleware";

const a = express.Router();
const validator = createValidator({
  passError: true,
});

a.get(
  "/",
  isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN]),
  validator.query(schema.userList),
  auth.getUsers
);
a.post(
  "/",
  isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN]),
  validator.body(schema.addUser),
  auth.addUser
);
a.put(
  "/:userId",
  isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN]),
  validator.body(schema.updateUser),
  auth.updateUser
);
a.patch(
  "/:userId/status",
  isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN]),
  validator.body(schema.patchUserStatus),
  auth.patchUserStatus
);
a.patch(
  "/:userId/setTemporaryPassword",
  isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN]),
  validator.body(schema.patchSetPassword),
  auth.pathSetTemporaryPassword
);

export = a;
