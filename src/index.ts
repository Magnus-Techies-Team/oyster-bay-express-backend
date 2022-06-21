import server from "./server";

(async () => {
  await server.initLocalDatabases();
  server.initServer(3000, "0.0.0.0");
  server.initFastifyWebsocketServer();
})();
