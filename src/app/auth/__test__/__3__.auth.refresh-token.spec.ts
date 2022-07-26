import app from "../../../main";
import request from "supertest";
import userRepo from "../../users/users.repo";

import {
  commonPassword,
  roleLoginCredentails,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "../../customers/__test__/helper";

import { expect } from "chai";
let refreshToken: string;

describe("Auth Suit (POST /auth/refreshToken)", () => {
  before(async function () {
    const loginResult = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.superAdmin.credentails);

    refreshToken = loginResult.body.data.refreshToken;
  });

  it("refresh token - Superadmin, httpcode #200", async () => {
    const result = await request(app).post("/auth/refreshToken").set("user-agent", "mocha").send({
      refreshToken: refreshToken,
    });

    expect(result.body.data).to.have.property("refreshToken");
    expect(result.statusCode).to.equal(200);
  });

  it("send invalid refresh token, httpcode #441", async () => {
    const result = await request(app).post("/auth/refreshToken").set("user-agent", "mocha").send({
      refreshToken: "2341241234242142134234213",
    });

    expect(result.statusCode).to.equal(441);
  });

  it("field not send in parameter, httpcode #422", async () => {
    const result = await request(app)
      .post("/auth/refreshToken")
      .set("user-agent", "mocha")
      .send({});

    expect(result.statusCode).to.equal(422);
  });
});
