"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = __importDefault(require("../../../main"));
const supertest_1 = __importDefault(require("supertest"));
// var envPath = __dirname + "/../../../.env";
// require('dotenv').config({path:envPath});
const chai_1 = require("chai");
const constants_1 = require("../../../helper/constants");
const commonPassword = "Birko@123";
const roleData = {
    superAdmin: {
        credentails: {
            "email": "superadmin@yopmail.com",
            "password": commonPassword
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN
    },
    admin: {
        credentails: {
            "email": "admin@yopmail.com",
            "password": commonPassword
        },
        role: constants_1.ENUM_User_ROLE.ADMIN
    },
    teamMember: {
        credentails: {
            "email": "teammember@yopmail.com",
            "password": commonPassword
        },
        role: constants_1.ENUM_User_ROLE.TEAM_MEMBER
    },
    customer: {
        credentails: {
            "email": "customer@yopmail.com",
            "password": commonPassword
        },
        role: constants_1.ENUM_User_ROLE.CUSTOMER_USER
    },
    deactiveSuperadmin: {
        credentails: {
            "email": "deactive_superadmin@yopmail.com",
            "password": commonPassword
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN
    },
    settemporarypasswordSuperadmin: {
        credentails: {
            "email": "settemporarypassword_superadmin@yopmail.com",
            "password": commonPassword
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN
    },
};
describe("Auth Suit", () => {
    describe("POST /auth/login", () => {
        it("Correct credentails - Superadmin", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.superAdmin.credentails);
            chai_1.expect(result.body.data).to.have.property('accessToken');
            chai_1.expect(result.body.data).to.have.property('refreshToken');
            chai_1.expect(result.body.data).to.have.property('user');
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.SUPERADMIN);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("Correct credentails - Admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.admin.credentails);
            chai_1.expect(result.body.data).to.have.property('accessToken');
            chai_1.expect(result.body.data).to.have.property('refreshToken');
            chai_1.expect(result.body.data).to.have.property('user');
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.ADMIN);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("Correct credentails - TeamMember", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.teamMember.credentails);
            chai_1.expect(result.body.data).to.have.property('accessToken');
            chai_1.expect(result.body.data).to.have.property('refreshToken');
            chai_1.expect(result.body.data).to.have.property('user');
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.TEAM_MEMBER);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("Correct credentails - Customer", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.customer.credentails);
            chai_1.expect(result.body.data).to.have.property('accessToken');
            chai_1.expect(result.body.data).to.have.property('refreshToken');
            chai_1.expect(result.body.data).to.have.property('user');
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.CUSTOMER_USER);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("In-correct credentails - http code 401", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send({ email: "testing@hello.com", password: "sdfsadf" });
            chai_1.expect(result.statusCode).to.equal(401);
        }));
        it("In-correct credentails if email address exist in db - http code 401", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send({ email: "superadmin@yopmail.com", password: "sdfsadf" });
            chai_1.expect(result.statusCode).to.equal(401);
        }));
        it("email field not send - http code 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send({ password: "sdfsadf" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("password field not send - http code 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send({ email: "sdfsadf" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("login with de-active user - Superadmin -- http code: 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.deactiveSuperadmin.credentails);
            chai_1.expect(result.body.message).to.equal("Your account is deactivated, please contact super admin.");
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("settemporarypassword user try to login - Superadmin -- http code: 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.settemporarypasswordSuperadmin.credentails);
            chai_1.expect(result.body.data).to.have.property('accessToken');
            chai_1.expect(result.body.data).to.have.property('refreshToken');
            chai_1.expect(result.body.data).to.have.property('user');
            chai_1.expect(result.body.data.user.setTemporaryPassword).to.equal(1);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
    });
});
