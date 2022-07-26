import express from "express";
import auth from "./app/auth/auth.route";
import users from "./app/users/users.route";
import user from "./app/users/user/user.route";
import customers from "./app/customers/customers.route";
import documents from "./app/documents/documents.route";
import teammembers from "./app/teammembers/teammembers.route";
import documentTypes from "./app/documenttypes/documenttypes.route";
import regions from "./app/regions/regions.route";
import eventTypes from "./app/eventtypes/eventtypes.route";
import eventLogs from "./app/eventLogs/eventlogs.route";

const app = express();

app.get("/", function (req: any, res: any, next: any) {
  res.send("Welcome to Birko");
});
app.use(`/auth`, auth);
app.use(`/users`, users);
app.use(`/user`, user);
app.use(`/customers`, customers);
app.use(`/documents`, documents);
app.use(`/teammembers`, teammembers);
app.use(`/documentTypes`, documentTypes);
app.use(`/regions`, regions);
app.use(`/eventTypes`, eventTypes);
app.use(`/eventLogs`, eventLogs);

export = app;
