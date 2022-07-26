const Joi = require("@hapi/joi");

const authSchema = {
  teamMemberList: Joi.object({
    filter: Joi.object({
      firstLastAndEmail: Joi.string(),
    }),
  }),
};

export default authSchema;
