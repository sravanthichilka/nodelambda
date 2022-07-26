const Joi = require('@hapi/joi');

const authSchema ={

    fetchEventTypes: Joi.object({
        showCustomerEventLogList: Joi.boolean().default(false)
     }),
}

export default authSchema