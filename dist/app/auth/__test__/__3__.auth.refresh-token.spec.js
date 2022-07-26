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
const helper_1 = require("../../customers/__test__/helper");
const chai_1 = require("chai");
let refreshToken;
describe("Auth Suit (POST /auth/refreshToken)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const loginResult = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.superAdmin.credentails);
            refreshToken = loginResult.body.data.refreshToken;
        });
    });
    it("refresh token - Superadmin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield supertest_1.default(main_1.default).post("/auth/refreshToken").set("user-agent", "mocha").send({
            refreshToken: refreshToken,
        });
        chai_1.expect(result.body.data).to.have.property("refreshToken");
        chai_1.expect(result.statusCode).to.equal(200);
    }));
    it("send invalid refresh token, httpcode #441", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield supertest_1.default(main_1.default).post("/auth/refreshToken").set("user-agent", "mocha").send({
            refreshToken: "2341241234242142134234213",
        });
        chai_1.expect(result.statusCode).to.equal(441);
    }));
    it("field not send in parameter, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield supertest_1.default(main_1.default)
            .post("/auth/refreshToken")
            .set("user-agent", "mocha")
            .send({});
        chai_1.expect(result.statusCode).to.equal(422);
    }));
});
