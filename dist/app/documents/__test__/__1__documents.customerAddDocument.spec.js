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
const helper_1 = require("../../customers/__test__/helper");
const customers_repo_1 = __importDefault(require("../../customers/customers.repo"));
const addDocument = {
    documentKeyName: "logo.png",
    documentType: 1,
    documentName: "BIRKO_LOGO",
    documentFormat: "png",
    documentsizeInByte: "4000000",
};
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company1_DETAIL;
let company2_DETAIL;
describe("Customer addDocument Suit (POST /customers/:companyId/documents)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            company1_DETAIL = yield customers_repo_1.default.companyData(1);
            company2_DETAIL = yield customers_repo_1.default.companyData(2);
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("add document by superadmin, http code #201", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            addDocument.documentKeyName =
                company1_DETAIL.preS3KeyName +
                    "/" +
                    constants_1.ENUM_PREFIX_FILE_PATH.DOC +
                    "/" +
                    new Date().getTime() +
                    ".png";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(201);
        }));
        it("again same document name add by superadmin, duplicate file name, http code #409", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("send invalid field , logged in superadmin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add document by superadmin, deactive customer , http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/3/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from admin", () => {
        it("add document by admin, http code #201", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            addDocument.documentKeyName =
                company1_DETAIL.preS3KeyName + "/docs/" + new Date().getTime() + ".png";
            addDocument.documentName = "birkologo_admin";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(201);
        }));
        it("again same document name add by admin, duplicate file name, http code #409", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_admin";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("send invalid field , logged in admin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_admin";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add document by admin, deactive customer , http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_admin";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/3/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from teammember", () => {
        it("add document by teammember, customer #1, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            addDocument.documentKeyName = "birkologo_teammember.png";
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("again same document name add by teammember, customer #1, duplicate file name, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add document by teammember, customer #2, http code #201", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            addDocument.documentKeyName = "birkologo_teammember.png";
            addDocument.documentName = "birkologo_teammember";
            addDocument.documentKeyName =
                company2_DETAIL.preS3KeyName + "/docs/" + new Date().getTime() + ".png";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/2/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(201);
        }));
        it("again same document name add by teammember, customer #2, duplicate file name, http code #409", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/2/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("add document by teammember, customer #3, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/3/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("again same document name add by teammember, customer #3, duplicate file name, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/3/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("send invalid field , logged in teammember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add document by teammember, deactive customer , http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/3/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from customer", () => {
        it("add document by customer, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("again same document name add by customer, duplicate file name, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("send invalid field , logged in customer, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/1/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add document by customer, deactive customer , http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/3/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add document by customer, not link with customer, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            addDocument.documentName = "birkologo_teammember";
            const result = yield supertest_1.default(main_1.default)
                .post(`/customers/2/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
