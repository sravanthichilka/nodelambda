"use strict";
const Joi = require('@hapi/joi');
const validator = function (schema) {
    return (req, res, next) => {
        var errors = {};
        const rules = schema.validate(req);
        if (rules.error) {
            var error = rules.error.details;
            var firstError = error[0].context.key;
            for (var e of error) {
                let key = e.context.key;
                let label = e.context.label;
                errors[key] = e.message.replace(/['"]+/g, '').replace('body.', '');
            }
            return res.status(422).send({
                status_code: 422,
                isJoi: true,
                message: errors[firstError],
                rules: errors,
            });
        }
        else {
            next();
        }
    };
};
module.exports = validator;
