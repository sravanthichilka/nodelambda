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
import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";

let verificationCode: string;
let verificationCode_activeSuperDeactiveIt: string;

describe("Auth Suit (POST /auth/resetpassword)", () => {
  before(async function () {
    const condition = { email: roleLoginCredentails.superAdmin.credentails.email };
    const user: any = await userRepo.searchUser(condition);
    verificationCode = user.verificationCode;

    const condition_activeSuperDeactiveIt = {
      email: roleLoginCredentails.activeSuperadmindeactiveAfterForgotPassword.credentails.email,
    };
    const user_activeSuperDeactiveIt: any = await userRepo.searchUser(
      condition_activeSuperDeactiveIt
    );
    verificationCode_activeSuperDeactiveIt = user_activeSuperDeactiveIt.verificationCode;
  });

  it("inactive user, can not do reset password, httpcode #403", async () => {
    // inactive user can not do forgot password.
    const result = await request(app).post("/auth/resetPassword").set("user-agent", "mocha").send({
      token: verificationCode_activeSuperDeactiveIt,
      password: commonPassword,
      confirmPassword: commonPassword,
    });

    expect(result.body.message).to.equal(
      "Your account is deactivated, please contact super admin."
    );
    expect(result.statusCode).to.equal(403);
  });

  it("Correct email, incorrect password, httpcode #422", async () => {
    const result = await request(app).post("/auth/resetPassword").set("user-agent", "mocha").send({
      token: verificationCode,
      password: commonPassword,
      confirmPassword: "commonPassword",
    });

    expect(result.statusCode).to.equal(422);
  });

  it("Correct email and password sent exist in db, httpcode #200", async () => {
    const result = await request(app).post("/auth/resetPassword").set("user-agent", "mocha").send({
      token: verificationCode,
      password: commonPassword,
      confirmPassword: commonPassword,
    });

    expect(result.body.message).to.equal("Password reset Successfully.");
    expect(result.statusCode).to.equal(200);
  });

  it("field not send in parameter send not exist in db - http code #422", async () => {
    const result = await request(app)
      .post("/auth/resetPassword")
      .set("user-agent", "mocha")
      .send({});

    expect(result.statusCode).to.equal(422);
  });

  it("Reset password successful then try login, httpcode #200", async () => {
    const result = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.superAdmin.credentails);

    expect(result.body.data).to.have.property("accessToken");
    expect(result.body.data).to.have.property("refreshToken");
    expect(result.body.data).to.have.property("user");
    expect(result.body.data.user.setTemporaryPassword).to.equal(0);
    expect(result.statusCode).to.equal(200);
  });
});
