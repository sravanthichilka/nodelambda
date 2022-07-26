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
const chai_1 = require("chai");
const constants_1 = require("../../../helper/constants");
const helper_1 = require("./helper");
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company_1_UserListIds = [];
let company_2_UserListIds = [];
let companyListIds = [];
describe("Customer Suit (PATCH /customers/:companyId/status)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
            companyListIds = yield helper_1.getCompanyIdsFn(SUPERADMIN_ACCESS_TOKEN);
            companyListIds.sort();
            company_1_UserListIds = yield helper_1.getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 1);
            company_2_UserListIds = yield helper_1.getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 2);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("inactive customer #1, by superadmin,  http code 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.INACTIVE });
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("inactive customer #3, by superadmin,  http code 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[2] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.INACTIVE });
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("active customer  #1, by superadmin,  http code 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.ACTIVE });
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("again active customer  #1, by superadmin,  http code 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.ACTIVE });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("inactive customer  #1, by admin,  http code 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.INACTIVE });
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("active customer  #1, by admin,  http code 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.ACTIVE });
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("again active customer  #1, by admin,  http code 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.ACTIVE });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("inactive customer, by teammember, not link company #1  http code 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.INACTIVE });
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("inactive customer, by teammember, link company #2  http code 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[1] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.INACTIVE });
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("active customer, by teammember,link company #2  http code 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[1] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.ACTIVE });
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("again active customer, by teammember, link company #2  http code 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[1] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.ACTIVE });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from customermember", () => {
        it("inactive customer, by customermember,  http code 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.INACTIVE });
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("active customer, by teammember,  http code 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.ACTIVE });
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("again active customer, by teammember,  http code 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .patch("/customers/" + companyListIds[0] + "/status")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send({ status: constants_1.ENUM_User_Status.ACTIVE });
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
