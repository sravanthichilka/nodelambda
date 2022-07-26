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
describe("Team member Suit", () => {
    describe("GET /teammembers/fetch", () => {
        it("Correct credentails - Superadmin, no header send", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set('user-agent', "mocha")
                .send(roleData.superAdmin.credentails);
            chai_1.expect(result.body.message).to.equal("authorization is required");
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("Correct credentails - Superadmin, header send", () => __awaiter(void 0, void 0, void 0, function* () {
            const loginResult = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.superAdmin.credentails);
            const accessToken = loginResult.body.data.accessToken;
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set('user-agent', "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.body.data).to.have.property('records');
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("Correct credentails - Admin, header send", () => __awaiter(void 0, void 0, void 0, function* () {
            const loginResult = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.admin.credentails);
            const accessToken = loginResult.body.data.accessToken;
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set('user-agent', "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.body.data).to.have.property('records');
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("Correct credentails - TeamMember, header send http code  - 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const loginResult = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.teamMember.credentails);
            const accessToken = loginResult.body.data.accessToken;
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set('user-agent', "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
            chai_1.expect(result.body.message).to.equal("FORBIDDEN");
        }));
        it("filter[firstLastAndEmail] send,  teammember Correct, header send http code ", () => __awaiter(void 0, void 0, void 0, function* () {
            const loginResult = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send(roleData.superAdmin.credentails);
            const accessToken = loginResult.body.data.accessToken;
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch?filter[firstLastAndEmail]=" + roleData.teamMember.credentails.email)
                .set('user-agent', "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.body.data).to.have.property('records');
            chai_1.expect(result.body.data.records[0]).to.have.property('id');
            chai_1.expect(result.statusCode).to.equal(200);
        }));
    });
});
