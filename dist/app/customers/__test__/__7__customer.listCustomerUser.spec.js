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
const addCustomerUserData = {
    firstName: "ns",
    lastName: "ns",
    email: "new_cu1@yopmail.com",
    temporaryPassword: helper_1.commonPassword,
};
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
describe("List Customer User Suit GET /customers/:companyId/users", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("get customer user in company id #1 by superadmin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("list customer user by filter[firstLastAndEmail] company id #1 by superadmin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("list customer user by sortBy[lastName]=desc company id #1 by superadmin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?sortBy[lastName]=desc")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("send invalid data filter[firstLastAndEmail1] company id #1 by superadmin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail1]=yopmail.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("list customer user by filter[firstLastAndEmail] company id #1 by superadmin with empty records, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail123.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data.records).to.be.eql([]);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
    });
    describe("Logged in from admin", () => {
        it("get customer user in company id #1 by admin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("list customer user by filter[firstLastAndEmail] company id #1 by admin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("list customer user by sortBy[lastName]=desc company id #1 by admin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?sortBy[lastName]=desc")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("send invalid data filter[firstLastAndEmail1] company id #1 by admin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail1]=yopmail.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("list customer user by filter[firstLastAndEmail] company id #1 by admin with empty records, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail123.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data.records).to.be.eql([]);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
    });
    describe("Logged in from teammember", () => {
        it("get customer user in company id #1 by teammember, not link, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("list customer user by filter[firstLastAndEmail] company id #1, not link by teammember, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("list customer user by sortBy[lastName]=desc company id #1 by teammember, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?sortBy[lastName]=desc")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("send invalid data filter[firstLastAndEmail1] company id #1 by teammember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail1]=yopmail.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("list customer user by filter[firstLastAndEmail] company id #2 by teammember with empty records, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/2/users?filter[firstLastAndEmail]=@yopmail123.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data.records).to.be.eql([]);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
    });
    describe("Logged in from customuser", () => {
        it("get customer user in company id #1 by customuser, not link, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("list customer user by filter[firstLastAndEmail] company id #1 by customeruser, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("list customer user by sortBy[lastName]=desc company id #1 by customer user, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?sortBy[lastName]=desc")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("send invalid data filter[firstLastAndEmail1] company id #1 by customeruser, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail1]=yopmail.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("list customer user by filter[firstLastAndEmail] company id #1 by customeruser with empty records, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail123.com")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
