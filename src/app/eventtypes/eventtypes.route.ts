import express from 'express';
import auth from './eventtypes.controller';
import schema from './eventtypes.validator';
import { createValidator } from 'express-joi-validation';
import isAccessTokenValidMiddleware from '../../middleware/multipleAccessMiddleware';
import { ENUM_User_ROLE } from '../../helper/constants';

const a = express.Router();
const validator = createValidator({
  passError: true
});

//sprint 3
a.get('/fetch', isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN, ENUM_User_ROLE.TEAM_MEMBER, ENUM_User_ROLE.CUSTOMER_USER]), validator.query(schema.fetchEventTypes),  auth.fetchEventTypes);

export = a;
