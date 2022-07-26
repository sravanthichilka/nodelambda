import log from "../helper/logs";
import * as dotenv from "dotenv";
dotenv.config();

export namespace Knex {
  export const config = {
    client: process.env.DB_CLIENT,
    // debug: true,
    connection: {
      host: process.env.DB_HOSTNAME,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      typeCast: function (field: any, next: any) {
        return next();
      },
    },
    pool: {
      min: parseInt(<string>process.env.DB_POOL_MIN),
      max: parseInt(<string>process.env.DB_POOL_MAX),
    },
    migrations: {
      tableName: "KnexMigrations",
    },
  };

  log.info(["connect to mysql: ", config]);
}

export default { Knex };
