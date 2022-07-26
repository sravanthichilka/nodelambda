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
const helper_1 = require("./helper");
const updateCustomerUserData = {
    link: "http://google.com",
};
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
describe("Customer onSiteSystemData Suit (PATCH /customers/:companyId/onSiteSystemData)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("update onSiteSystemData by superadmin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("send invalid field , logged in superadmin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("update onSiteSystemData by admin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("send invalid field , logged in admin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("update onSiteSystemData customer #1 by teammember, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update onSiteSystemData customer #2 by teammember, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("send invalid field customer #1  , logged in teammember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from customer", () => {
        it("update onSiteSystemData customer #1 by customer, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("send invalid field customer #1  , logged in teammember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/onSiteSystemData`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
});
