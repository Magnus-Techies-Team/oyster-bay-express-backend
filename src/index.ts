import DBHelper from "./dataSources/DBHelper";
import { postgresConfig } from "./dataSources/pgConfig";
import server from "./server";

(async () => {
  await DBHelper.init(postgresConfig);
  await server.initLocalDatabases();
  await server.initServer(<number><unknown>process.env.PORT, <string>process.env.HOST);
  // server.initFastifyWebsocketServer();
})();
