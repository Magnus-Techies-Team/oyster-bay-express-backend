import { server, dbHelper } from "~/projectDependencies";
import { postgresConfig } from "~/dataSources/pgConfig";
import { seedDB } from "./seeding";

(async () => {
  server.registerApi();
  await dbHelper.init(postgresConfig);
  await seedDB();
  await server.initServer(
    <number>(<unknown>process.env.PORT),
    <string>process.env.HOST
  );
  server.initFastifyWebsocketServer();
})();
