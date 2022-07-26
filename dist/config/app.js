"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("../helper/constants");
const Joi = require("joi");
let dotEnvConfig = dotenv_1.default.config({ debug: true });
if (dotEnvConfig.error) {
    throw dotEnvConfig.error;
}
function validateEnvConfiguration() {
    const dbSchema = {
        APP_NAME: Joi.string().required(),
        APP_ENVIRONMENT: Joi.string().required(),
        APP_URL: Joi.string().required(),
        BACKEND_URL: Joi.string().required(),
        DB_CLIENT: Joi.string().required(),
        DB_HOSTNAME: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_POOL_MIN: Joi.string().required(),
        DB_POOL_MAX: Joi.string().required(),
        JWT_SECRET_KEY: Joi.string().required(),
        JWT_TOKEN_EXPIRES_IN: Joi.string().required(),
        JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN: Joi.string().required(),
        JWT_REFRESH_KEY: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.number().required(),
        PORT: Joi.string().required(),
        SES_AWS_REGION: Joi.string().required(),
        SES_SENDER_EMAIL: Joi.string().required(),
        SES_USERNAME: Joi.string().required(),
        SES_PASSWORD: Joi.string().required(),
        WEB_LINK: Joi.string().required(),
        WEB_RESET_PASSWORD: Joi.string().required(),
        S3_CLOUDFRONT_URL_TEST: Joi.string().required(),
        S3_AWS_CLOUDFRONT_ACCESSKEY: Joi.string().required(),
        S3_AWS_CLOUDFRONT_PK: Joi.string().required(),
        S3_AWS_BUCKET_NAME: Joi.string().required(),
        S3_CREATE_PRESIGNED_POST_SECOND: Joi.number().required(),
        CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND: Joi.number().required(),
        DB_MONGO_DB: Joi.string().required(),
        DB_MONGO_TLS_IN_SECOND: Joi.number().required(),
    };
    if (dotEnvConfig.parsed.APP_ENVIRONMENT === constants_1.APP_ENVIRONMENT.LOCAL) {
        dbSchema.SES_SECRET_KEY = Joi.string().required();
        dbSchema.SES_ACCESS_KEY = Joi.string().required();
    }
    const schema = Joi.object(dbSchema);
    const isFiniteNumber = isFinite(dotEnvConfig.parsed.JWT_REFRESH_EXPIRES_IN);
    const isFiniteNumberPresignedPostSecond = isFinite(dotEnvConfig.parsed.S3_CREATE_PRESIGNED_POST_SECOND);
    const isFiniteNumberCloudfrontGetExpireTimeInSecond = isFinite(dotEnvConfig.parsed.CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND);
    if (isFiniteNumber || isFiniteNumberPresignedPostSecond) {
        dotEnvConfig.parsed.JWT_REFRESH_EXPIRES_IN = parseInt(dotEnvConfig.parsed.JWT_REFRESH_EXPIRES_IN);
        dotEnvConfig.parsed.S3_CREATE_PRESIGNED_POST_SECOND = parseInt(dotEnvConfig.parsed.S3_CREATE_PRESIGNED_POST_SECOND);
    }
    else {
        throw Error("JWT_REFRESH_EXPIRES_IN: env is in-valid");
    }
    if (isFiniteNumberCloudfrontGetExpireTimeInSecond) {
        dotEnvConfig.parsed.CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND = parseInt(dotEnvConfig.parsed.CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND);
    }
    else {
        throw Error("CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND: env is in-valid");
    }
    const isDBMONGOTLSINSECOND = isFinite(dotEnvConfig.parsed.DB_MONGO_TLS_IN_SECOND);
    if (isDBMONGOTLSINSECOND) {
        dotEnvConfig.parsed.DB_MONGO_TLS_IN_SECOND = parseInt(dotEnvConfig.parsed.DB_MONGO_TLS_IN_SECOND);
    }
    else {
        throw Error("DB_MONGO_TLS_IN_SECOND: env is in-valid");
    }
    const isEnvValidate = schema.validate(dotEnvConfig.parsed);
    if (isEnvValidate.error) {
        throw Error(isEnvValidate.error.message);
    }
}
validateEnvConfiguration();
exports.default = {
    app: {
        APP_NAME: process.env.APP_NAME,
        PORT: process.env.PORT,
        ENVIRONMENT: process.env.APP_ENVIRONMENT,
        APP_URL: process.env.APP_URL,
    },
    web: {
        LINK: process.env.WEB_LINK,
        RESET_PASSWORD_LINK: process.env.WEB_RESET_PASSWORD,
    },
    BACKEND: {
        BASE_URL: process.env.BACKEND_URL,
    },
    jwt: {
        SECRET_KEY: process.env.JWT_SECRET_KEY,
        REFRESH_KEY: process.env.JWT_REFRESH_KEY,
        TOKEN_EXPIRES_IN: process.env.JWT_TOKEN_EXPIRES_IN,
        REFRESH_EXPIRES_IN: parseInt(process.env.JWT_REFRESH_EXPIRES_IN),
        RESET_PASSWORD_EXPIRES_IN: process.env.JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN,
    },
    S3: {
        CLOUDFRONT_URL_TEST: process.env.S3_CLOUDFRONT_URL_TEST,
        AWS_CLOUDFRONT_ACCESSKEY: process.env.S3_AWS_CLOUDFRONT_ACCESSKEY,
        AWS_CLOUDFRONT_PK: process.env.S3_AWS_CLOUDFRONT_PK,
        AWS_BUCKET_NAME: process.env.S3_AWS_BUCKET_NAME,
        S3_CREATE_PRESIGNED_POST_SECOND: process.env.S3_CREATE_PRESIGNED_POST_SECOND,
        CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND: parseInt(process.env.CLOUDFRONT_GET_EXPIRE_TIME_IN_SECOND),
    },
    google: {
        RECAPTCHA_SECRET: process.env.GOOGLE_RECAPTCHA_SECRET,
    },
    MAIL: {
        SES_AWS_REGION: process.env.SES_AWS_REGION,
        SES_SENDER_EMAIL: process.env.SES_SENDER_EMAIL,
        SES_SECRET_KEY: process.env.SES_SECRET_KEY,
        SES_ACCESS_KEY: process.env.SES_ACCESS_KEY,
        SES_USERNAME: process.env.SES_USERNAME,
        SES_PASSWORD: process.env.SES_PASSWORD,
    },
    MONGO_DB: {
        DB_MONGO_DB: process.env.DB_MONGO_DB,
        DB_MONGO_TLS_IN_SECOND: parseInt(process.env.DB_MONGO_TLS_IN_SECOND),
    },
};
