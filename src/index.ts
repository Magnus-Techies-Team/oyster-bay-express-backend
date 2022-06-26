import server from "./server";

(async () => {
  await server.initLocalDatabases();
  await server.initServer(<number><unknown>process.env.PORT, <string>process.env.HOST);
  // server.initFastifyWebsocketServer();
})();
