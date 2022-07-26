import express from 'express';
import auth from './user.controller';
import schema from './user.validator';
import { createValidator } from 'express-joi-validation';
import isAccessTokenValidMiddleware from '../../../middleware/multipleAccessMiddleware';
import { ENUM_User_ROLE, ENUM_User_Status } from '../../../helper/constants';


const a = express.Router();
const validator = createValidator({
  passError: true
});

a.put('/profile', isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN, ENUM_User_ROLE.TEAM_MEMBER, ENUM_User_ROLE.CUSTOMER_USER]), validator.body(schema.viewProfile), auth.userProfile);
a.get('/me', isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN, ENUM_User_ROLE.TEAM_MEMBER, ENUM_User_ROLE.CUSTOMER_USER]), validator.query(schema.getMe), auth.userMe);
a.patch('/setPassword', isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN, ENUM_User_ROLE.TEAM_MEMBER, ENUM_User_ROLE.CUSTOMER_USER], [ENUM_User_Status.ACTIVE, ENUM_User_Status.PENDING]), validator.body(schema.setPassword), auth.setPassword);
a.get('/myEventLog', isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN, ENUM_User_ROLE.TEAM_MEMBER, ENUM_User_ROLE.CUSTOMER_USER]), validator.query(schema.myEventList), auth.myEventLog);

export = a;
