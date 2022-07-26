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
const helper_1 = require("../../customers/__test__/helper");
const message_1 = __importDefault(require("../../../helper/message"));
let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
const updateUserStatus = {
    setTemporaryPassword: helper_1.commonPassword,
};
describe("Team member  (GET /teammembers/fetch)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const superAdmin = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            SUPERADMIN_ACCESS_TOKEN = superAdmin.accessToken;
            SUPERADMIN_REFRESH_ACCESS_TOKEN = superAdmin.refreshToken;
            const admin = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.admin.credentails);
            ADMIN_ACCESS_TOKEN = admin.accessToken;
            ADMIN_REFRESH_ACCESS_TOKEN = admin.refreshToken;
            const teammember = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.teamMember.credentails);
            TEAMMEMBER_ACCESS_TOKEN = teammember.accessToken;
            TEAMMEMBER_REFRESH_ACCESS_TOKEN = teammember.refreshToken;
            const customeruser = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.customer.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = customeruser.accessToken;
            CUSTOMER_USER_REFRESH_ACCESS_TOKEN = customeruser.refreshToken;
        });
    });
    describe("Logged in from Superadmin", () => {
        it("Correct credentails - Superadmin, no header send, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.superAdmin.credentails);
            chai_1.expect(result.statusCode).to.equal(422);
            chai_1.expect(result.body.message).to.equal(message_1.default.AUTHORIZATION_REQUIRED);
        }));
        it("Correct credentails - Superadmin, header send , httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
        }));
        it("filter[firstLastAndEmail] send, header send, httpcode #200 ", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch?filter[firstLastAndEmail]=" +
                helper_1.roleLoginCredentails.teamMember.credentails.email)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data.records[0]).to.have.property("id");
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("invalide filter[firstLastAndEmail1] send, header send, httpcode #422 ", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch?filter[firstLastAndEmail1]=" +
                helper_1.roleLoginCredentails.teamMember.credentails.email)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("Correct credentails, no header send, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.admin.credentails);
            chai_1.expect(result.statusCode).to.equal(422);
            chai_1.expect(result.body.message).to.equal(message_1.default.AUTHORIZATION_REQUIRED);
        }));
        it("Correct credentails, header send , httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
        }));
        it("filter[firstLastAndEmail] send, header send, httpcode #200 ", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch?filter[firstLastAndEmail]=" +
                helper_1.roleLoginCredentails.teamMember.credentails.email)
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data.records[0]).to.have.property("id");
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("invalide filter[firstLastAndEmail1] send, header send, httpcode #422 ", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch?filter[firstLastAndEmail1]=" +
                helper_1.roleLoginCredentails.teamMember.credentails.email)
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("Correct credentails, header send , httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("filter[firstLastAndEmail] send, header send, httpcode #403 ", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch?filter[firstLastAndEmail]=" +
                helper_1.roleLoginCredentails.teamMember.credentails.email)
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from customer", () => {
        it("Correct credentails, header send , httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("filter[firstLastAndEmail] send, header send, httpcode #403 ", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/teammembers/fetch?filter[firstLastAndEmail]=" +
                helper_1.roleLoginCredentails.teamMember.credentails.email)
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
