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
let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
const addCustomerData = {
    customerUser: {
        firstName: "test",
        lastName: "test",
        email: "tes11t12221@gmail.com",
        temporaryPassword: "test",
    },
    companyInfo: {
        companyName: "test222111",
        companyAddress: "test",
        uniqueId: "test11221",
        regionId: 2,
    },
    assignedTeamMember: [1],
};
const pri_add_custuser_s = "pri_add_custuser_s@yopmail.com";
const pri_add_custuser_deactive_s = "pri_add_custuser_deactive_s@yopmail.com";
const pri_add_custuser_s_assignedtm = "pri_add_custuser_s_assignedtm@yopmail.com";
const pri_add_custuser_a = "pri_add_custuser_a@yopmail.com";
const pri_custuser_add_deactive_a = "pri_custuser_add_deactive_a@yopmail.com";
const pri_add_custuser__assignedtm = "pri_add_custuser__assignedtm@yopmail.com";
const pri_add_custuser_t = "pri_add_custuser_t@yopmail.com";
const pri_custuser_add_deactive_t = "pri_custuser_add_deactive_t@yopmail.com";
let teamUserIds = [];
function beforeAtSymbol(str) {
    return str.substring(0, str.search("@"));
}
//   pri_add_custuser_s@yopmail.com
// pri_add_custuser_deactive_s@yopmail.com
//pri_add_custuser_s_assignedtm@yopmail.com
// pri_add_custuser_a@yopmail.com
//pri_custuser_add_deactive_a@yopmail.com
//pri_add_custuser__assignedtm@yopmail.com
//pri_add_custuser_t@yopmail.com
//pri_custuser_add_deactive_t@yopmail.com
describe("Customer Suit (POST /customers) ", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const superAdmin = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            SUPERADMIN_ACCESS_TOKEN = superAdmin.accessToken;
            SUPERADMIN_REFRESH_ACCESS_TOKEN = superAdmin.refreshToken;
            teamUserIds = yield helper_1.getTeamUserIdsFn(SUPERADMIN_ACCESS_TOKEN);
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
        it("add customer, email pri_add_custuser_s, invalid assignedteammember ids, httpcode #409 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = pri_add_custuser_s;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_s);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_s);
            addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("add customer, pri_add_custuser_s@yopmail.com, httpcode #201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = pri_add_custuser_s;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_s);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_s);
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("add customer with same email, pri_add_custuser_s@yopmail.com httpcode #409 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = pri_add_custuser_s;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_s);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_s);
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("customerUser is not sending, httpcode #422 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            delete addCustomerDataCopy.customerUser;
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add customer, pri_add_custuser_deactive_s@yopmail.com customer, httpcode 201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = pri_add_custuser_deactive_s;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_deactive_s);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_deactive_s);
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("not send companyInfo is not sending, httpcode #422 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            delete addCustomerDataCopy.companyInfo;
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add customer by superadmin with assignedTeamMember, httpcode 201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.assignedTeamMember = teamUserIds;
            addCustomerDataCopy.customerUser.email = pri_add_custuser_s_assignedtm;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_s_assignedtm);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_s_assignedtm);
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
    });
    describe("Logged in from admin", () => {
        it("add customer, invalid assignedteammember ids, httpcode #409 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = "pri_add_custuser_a@yopmail.com";
            addCustomerDataCopy.companyInfo.companyName = "customeruser_admin";
            addCustomerDataCopy.companyInfo.uniqueId = "customeruseradmin";
            addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("add customer, pri_add_custuser_a@yopmail.com, httpcode #201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = pri_add_custuser_a;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_a);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_a);
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("add customer with same email, pri_add_custuser_a@yopmail.com httpcode #409 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = "pri_add_custuser_a@yopmail.com";
            addCustomerDataCopy.companyInfo.companyName = "customeruser_superadmin";
            addCustomerDataCopy.companyInfo.uniqueId = "customerusersuperadmin";
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("customerUser is not sending, httpcode #422 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            delete addCustomerDataCopy.customerUser;
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add customer, pri_custuser_add_deactive_a@yopmail.com customer, httpcode #201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = pri_custuser_add_deactive_a;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_custuser_add_deactive_a);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_custuser_add_deactive_a);
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("not send companyInfo is not sending, httpcode #422 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            delete addCustomerDataCopy.companyInfo;
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add customer by admin with assignedTeamMember, httpcode 201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.assignedTeamMember = teamUserIds;
            addCustomerDataCopy.customerUser.email = pri_add_custuser__assignedtm;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser__assignedtm);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser__assignedtm);
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
    });
    describe("Logged in from teammember", () => {
        it("add customer, invalid assignedteammember ids, httpcode #201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            // it will overwrite its own ID
        }));
        it("add customer, pri_add_custuser_t@yopmail.com, httpcode #201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = pri_add_custuser_t;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_t);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_t);
            addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("same add customer, pri_add_custuser_t@yopmail.com, httpcode #409 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = "pri_add_custuser_t@yopmail.com";
            addCustomerDataCopy.companyInfo.companyName = "pri_add_custuser_t";
            addCustomerDataCopy.companyInfo.uniqueId = "pri_add_custuser_t";
            addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("customerUser is not sending, httpcode #422 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            delete addCustomerDataCopy.customerUser;
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add customer, pri_custuser_add_deactive_t@yopmail.com customer, httpcode #201 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = pri_custuser_add_deactive_t;
            addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_custuser_add_deactive_t);
            addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_custuser_add_deactive_t);
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("not send companyInfo is not sending, httpcode #422 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            delete addCustomerDataCopy.companyInfo;
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from customer", () => {
        it("add customer, primary_customeruser_customer@yopmail.com, httpcode #403 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = "primary_customeruser_customer@yopmail.com";
            addCustomerDataCopy.companyInfo.companyName = "primary_customeruser_customer";
            addCustomerDataCopy.companyInfo.uniqueId = "primary_customeruser_customer";
            addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("same add customer, primary_customeruser_customer@yopmail.com, httpcode #403 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = "primary_customeruser_customer@yopmail.com";
            addCustomerDataCopy.companyInfo.companyName = "primary_customeruser_customer";
            addCustomerDataCopy.companyInfo.uniqueId = "primary_customeruser_customer";
            addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("customerUser is not sending, httpcode #403 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            delete addCustomerDataCopy.customerUser;
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add customer, customeruser_deactive_customer@yopmail.com customer, httpcode #403 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.customerUser.email = "customeruser_deactive_customer@yopmail.com";
            addCustomerDataCopy.companyInfo.companyName = "customeruser_deactive_customer";
            addCustomerDataCopy.companyInfo.uniqueId = "customeruser_deactive_customer";
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("not send companyInfo is not sending, httpcode #403 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            delete addCustomerDataCopy.companyInfo;
            const result = yield supertest_1.default(main_1.default)
                .post("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
