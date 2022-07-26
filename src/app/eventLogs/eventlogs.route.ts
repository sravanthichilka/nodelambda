import express from 'express';
import auth from './eventlogs.controller';
import schema from './eventlogs.validator';
import { createValidator } from 'express-joi-validation';
import isAccessTokenValidMiddleware from '../../middleware/multipleAccessMiddleware';
import { ENUM_User_ROLE } from '../../helper/constants';

const a = express.Router();
const validator = createValidator({
  passError: true
});

//sprint 3
a.get('/', isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN, ENUM_User_ROLE.TEAM_MEMBER]), validator.query(schema.eventList),  auth.fetchEventTypes);
a.get('/:id', isAccessTokenValidMiddleware([ENUM_User_ROLE.SUPERADMIN, ENUM_User_ROLE.ADMIN, ENUM_User_ROLE.TEAM_MEMBER]),  auth.eventTypeId);

export = a;
