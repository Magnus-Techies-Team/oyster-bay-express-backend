import { server } from "./projectDependencies";

(async () => {
  await server.registerApi();
  await server.initLocalDatabases();
  await server.initServer(3000, "0.0.0.0");
  server.initFastifyWebsocketServer();
})();
