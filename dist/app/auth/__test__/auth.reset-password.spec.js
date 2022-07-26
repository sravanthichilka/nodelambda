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
// var envPath = __dirname + "/../../../.env";
// require('dotenv').config({path:envPath});
// const condition = { verificationCode:reset_token, id: verified.id};
//     log.info([condition,"condition"])
const commonPassword = "Birko@123";
const chai_1 = require("chai");
describe("Auth Suit", () => {
    describe("POST /auth/resetpassword", () => {
        it("Correct email sent exist in db - Superadmin", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: "superadmin@yopmail.com" };
            const user = yield users_repo_1.default.searchUser(condition);
            const token = user.verificationCode;
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/resetPassword")
                .set('user-agent', "mocha")
                .send({
                token,
                password: commonPassword,
                confirmPassword: commonPassword
            });
            chai_1.expect(result.body.message).to.equal("Password reset Successfully.");
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("Reset password successful then try login - Superadmin", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set('user-agent', "mocha")
                .send({
                email: "superadmin@yopmail.com",
                password: commonPassword
            });
            chai_1.expect(result.body.data).to.have.property('accessToken');
            chai_1.expect(result.body.data).to.have.property('refreshToken');
            chai_1.expect(result.body.data).to.have.property('user');
            chai_1.expect(result.body.data.user.setTemporaryPassword).to.equal(0);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("field not send in parameter send not exist in db - http code 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/resetPassword")
                .set('user-agent', "mocha")
                .send({});
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
});
