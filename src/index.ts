import app from "./main";
import config from "./config/app";
import log from "./helper/logs";
const port = config.app.PORT;
app.listen(port, function () {
  log.info([`Server is running on ${port}`]);
});
