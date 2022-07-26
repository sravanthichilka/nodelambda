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
const users_repo_1 = __importDefault(require("../../users/users.repo"));
const constants_1 = require("../../../helper/constants");
const chai_1 = require("chai");
const helper_1 = require("../../customers/__test__/helper");
describe("Auth Suit (POST /auth/forgotPassword)", () => {
    describe("Logged in from Superadmin", () => {
        it("Correct email sent exist in db active_superadmin_deactive_afterforgotpassword@yopmail.com - Superadmin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateDate = Object.assign({}, helper_1.roleLoginCredentails.activeSuperadmindeactiveAfterForgotPassword.credentails);
            updateDate.password = "sdfsadf";
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/forgotPassword")
                .set("user-agent", "mocha")
                .send({ email: updateDate.email });
            const condition_activeSuperDeactiveIt = {
                email: helper_1.roleLoginCredentails.activeSuperadmindeactiveAfterForgotPassword.credentails.email,
            };
            const user_activeSuperDeactiveIt = yield users_repo_1.default.searchUser(condition_activeSuperDeactiveIt);
            yield users_repo_1.default.updateUser(user_activeSuperDeactiveIt.id, {
                status: constants_1.ENUM_User_Status.INACTIVE,
            });
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.message).to.equal("An reset link will be send to registered email.");
        }));
        it("Correct email sent exist in db  - Superadmin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateDate = Object.assign({}, helper_1.roleLoginCredentails.superAdmin.credentails);
            updateDate.password = "sdfsadf";
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/forgotPassword")
                .set("user-agent", "mocha")
                .send({ email: updateDate.email });
            chai_1.expect(result.body.message).to.equal("An reset link will be send to registered email.");
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("invalid email send not exist in db, httpcode #404", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/forgotPassword")
                .set("user-agent", "mocha")
                .send({ email: "superadmin1@yopmail.com" });
            chai_1.expect(result.statusCode).to.equal(404);
        }));
        it("email field not send in parameter send not exist in db, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/forgotPassword")
                .set("user-agent", "mocha")
                .send({});
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("inactive user Correct email sent exist in db, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateDate = Object.assign({}, helper_1.roleLoginCredentails.deactiveAdmin.credentails);
            updateDate.password = "sdfsadf";
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/forgotPassword")
                .set("user-agent", "mocha")
                .send({ email: updateDate.email });
            chai_1.expect(result.body.message).to.equal("Your account is deactivated, please contact super admin.");
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
