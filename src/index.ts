import { server, dbHelper } from "./projectDependencies";
import { postgresConfig } from "./dataSources/pgConfig";

(async () => {
  server.registerApi();
  await dbHelper.init(postgresConfig);
  await server.initLocalDatabases();
  await server.initServer(
    <number>(<unknown>process.env.PORT),
    <string>process.env.HOST
  );
  server.initFastifyWebsocketServer();
})();
