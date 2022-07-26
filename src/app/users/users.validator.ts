const Joi = require("@hapi/joi");
import { ENUM_User_ROLE, ENUM_User_Status } from "../../helper/constants";

const authSchema = {
  userList: Joi.object({
    viewRoleList: Joi.number().valid(
      ENUM_User_ROLE.SUPERADMIN,
      ENUM_User_ROLE.ADMIN,
      ENUM_User_ROLE.TEAM_MEMBER
    ),
    currentPage: Joi.number().default(1),
    recordPerPage: Joi.number().valid(10, 20, 30, 40, 50).default(10),
    sortBy: Joi.object({
      firstName: Joi.string().valid("asc", "desc"),
      lastName: Joi.string().valid("asc", "desc"),
      email: Joi.string().valid("asc", "desc"),
      status: Joi.string().valid("asc", "desc"),
      role: Joi.string().valid("asc", "desc"),
    }),
    filter: Joi.object({
      regionId: Joi.number(),
      firstLastAndEmail: Joi.string(),
    }),
  }),
  addUser: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.number()
      .valid(ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN, ENUM_User_ROLE.TEAM_MEMBER)
      .required(),
    temporaryPassword: Joi.string().required(),
    phoneNumber: Joi.string()
      .forbidden()
      .when("role", {
        is: ENUM_User_ROLE.TEAM_MEMBER,
        then: Joi.string()
          .pattern(/^[0-9]+$/)
          .required(),
      }),
    regionId: Joi.number().when("role", {
      switch: [{ is: ENUM_User_ROLE.TEAM_MEMBER, then: Joi.number().required() }],
      otherwise: Joi.forbidden(),
    }),
  }),
  updateUser: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().pattern(/^[0-9]+$/),
    regionId: Joi.number(),
  }),
  patchUserStatus: Joi.object({
    status: Joi.number().valid(ENUM_User_Status.ACTIVE, ENUM_User_Status.INACTIVE).required(),
  }),
  patchSetPassword: Joi.object({
    setTemporaryPassword: Joi.string().required(),
  }),
};

export default authSchema;
