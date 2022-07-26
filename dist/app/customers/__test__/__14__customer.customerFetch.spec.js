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
const updateCustomerUserData = {
    status: constants_1.ENUM_User_Status.INACTIVE,
};
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company_1_UserListIds = [];
let company_2_UserListIds = [];
describe("Customer Fetch Suit (GET /customers/15/documents/3/getCustomersForMoveDocument)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("fetch teammember, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/fetch`)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
    });
    describe("Logged in from admin", () => {
        it("fetch teammember, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/fetch`)
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
    });
    describe("Logged in from teammember", () => {
        it("fetch teammember, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/fetch`)
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
    });
    describe("Logged in from customer", () => {
        it("fetch teammember, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/fetch`)
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
