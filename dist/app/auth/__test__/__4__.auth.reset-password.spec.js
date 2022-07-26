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
const helper_1 = require("../../customers/__test__/helper");
const chai_1 = require("chai");
let verificationCode;
let verificationCode_activeSuperDeactiveIt;
describe("Auth Suit (POST /auth/resetpassword)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.superAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            verificationCode = user.verificationCode;
            const condition_activeSuperDeactiveIt = {
                email: helper_1.roleLoginCredentails.activeSuperadmindeactiveAfterForgotPassword.credentails.email,
            };
            const user_activeSuperDeactiveIt = yield users_repo_1.default.searchUser(condition_activeSuperDeactiveIt);
            verificationCode_activeSuperDeactiveIt = user_activeSuperDeactiveIt.verificationCode;
        });
    });
    it("inactive user, can not do reset password, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
        // inactive user can not do forgot password.
        const result = yield supertest_1.default(main_1.default).post("/auth/resetPassword").set("user-agent", "mocha").send({
            token: verificationCode_activeSuperDeactiveIt,
            password: helper_1.commonPassword,
            confirmPassword: helper_1.commonPassword,
        });
        chai_1.expect(result.body.message).to.equal("Your account is deactivated, please contact super admin.");
        chai_1.expect(result.statusCode).to.equal(403);
    }));
    it("Correct email, incorrect password, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield supertest_1.default(main_1.default).post("/auth/resetPassword").set("user-agent", "mocha").send({
            token: verificationCode,
            password: helper_1.commonPassword,
            confirmPassword: "commonPassword",
        });
        chai_1.expect(result.statusCode).to.equal(422);
    }));
    it("Correct email and password sent exist in db, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield supertest_1.default(main_1.default).post("/auth/resetPassword").set("user-agent", "mocha").send({
            token: verificationCode,
            password: helper_1.commonPassword,
            confirmPassword: helper_1.commonPassword,
        });
        chai_1.expect(result.body.message).to.equal("Password reset Successfully.");
        chai_1.expect(result.statusCode).to.equal(200);
    }));
    it("field not send in parameter send not exist in db - http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield supertest_1.default(main_1.default)
            .post("/auth/resetPassword")
            .set("user-agent", "mocha")
            .send({});
        chai_1.expect(result.statusCode).to.equal(422);
    }));
    it("Reset password successful then try login, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield supertest_1.default(main_1.default)
            .post("/auth/login")
            .set("user-agent", "mocha")
            .send(helper_1.roleLoginCredentails.superAdmin.credentails);
        chai_1.expect(result.body.data).to.have.property("accessToken");
        chai_1.expect(result.body.data).to.have.property("refreshToken");
        chai_1.expect(result.body.data).to.have.property("user");
        chai_1.expect(result.body.data.user.setTemporaryPassword).to.equal(0);
        chai_1.expect(result.statusCode).to.equal(200);
    }));
});
