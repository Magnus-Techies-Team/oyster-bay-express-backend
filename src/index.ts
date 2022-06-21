import server from "./server";

(async () => {
  await server.initLocalDatabases();
  await server.initServer(3000, "0.0.0.0");
})();