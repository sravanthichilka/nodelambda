const { default: AuthHelperController } = require("../src/app/auth/auth.helper");
const { ENUM_User_ROLE, ENUM_User_Status } = require("../src/helper/constants");

const commonPassword = "Birko@123";

const emailAndRole = [
  {
    role: ENUM_User_ROLE.SUPERADMIN,
    email: "annapurna.kenguva@appitventures.com",
    password: commonPassword,
  },
  { role: ENUM_User_ROLE.SUPERADMIN, email: "superadmin@yopmail.com", password: commonPassword },
  { role: ENUM_User_ROLE.ADMIN, email: "admin@yopmail.com", password: commonPassword },
  { role: ENUM_User_ROLE.TEAM_MEMBER, email: "teammember@yopmail.com", password: commonPassword },
  {
    role: ENUM_User_ROLE.SUPERADMIN,
    email: "deactive_superadmin@yopmail.com",
    password: commonPassword,
  },
  {
    role: ENUM_User_ROLE.SUPERADMIN,
    email: "active_superadmin_deactive_afterforgotpassword@yopmail.com",
    password: commonPassword,
  },
  { role: ENUM_User_ROLE.ADMIN, email: "deactive_admin@yopmail.com", password: commonPassword },
  {
    role: ENUM_User_ROLE.TEAM_MEMBER,
    email: "deactive_teammember@yopmail.com",
    password: commonPassword,
  },
  {
    role: ENUM_User_ROLE.SUPERADMIN,
    email: "settemporarypassword_superadmin@yopmail.com",
    password: commonPassword,
  },
];

exports.seed = async function (knex) {
  const userList = [];
  for (let recEmailAndRole of emailAndRole) {
    const test = new AuthHelperController();
    const salt = await test.createSalt();
    const hash = await test.createHash(salt, recEmailAndRole.email, recEmailAndRole.password);
    const aa = await test.hashCheck(
      { hash: hash, salt: salt },
      recEmailAndRole.email,
      recEmailAndRole.password
    );

    const user = {
      email: recEmailAndRole.email,
      firstName: "annapurna",
      lastName: "kenguva",
      phoneNumber: "8888888888",
      regionId: 1,
      role: recEmailAndRole.role,
      status: ENUM_User_Status.ACTIVE,
      salt: salt,
      hash: hash,
      setTemporaryPassword: 0,
      CreatedAt: knex.raw("CURRENT_TIMESTAMP"),
      UpdatedAt: knex.raw("CURRENT_TIMESTAMP"),
    };

    if (
      recEmailAndRole.email === "deactive_superadmin@yopmail.com" ||
      recEmailAndRole.email === "deactive_teammember@yopmail.com" ||
      recEmailAndRole.email === "deactive_admin@yopmail.com"
    ) {
      user.status = ENUM_User_Status.INACTIVE;
    }

    if (recEmailAndRole.email === "settemporarypassword_superadmin@yopmail.com") {
      user.setTemporaryPassword = 1;
    }

    userList.push(user);
  }

  return knex("users").insert(userList);
};
