const AccessControl = require("accesscontrol");
const ac = new AccessControl();
import log from "../helper/logs";

let roles = (function () {
  ac.grant("Administrator")
    .createAny(["checklist", "products", "locations", "notes"])
    .readAny(["checklist", "products", "locations", "notes"])
    .updateAny(["checklist", "locations", "notes"])
    .deleteAny(["checklist", "locations", "notes"]);

  ac.grant("Driver");

  ac.grant("Instructor");

  ac.grant("Franchisee");
  return ac;
})();
export default roles;
