
   
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { IncomingMessage, Server as httpServer, ServerResponse } from "http";
import generalHook from "./utils/generalHook";
import { plugin, pluginSet, router, routerSet } from "./serverTypes";
import { initLocalDatabasesIfNotExists } from "../dataSources/initLocalDatabases";
import { RouteOptions } from "@fastify/websocket";

export class Server {
  private setOfRouters: routerSet;
  private setOfPlugins: pluginSet;
  private serverInstace: FastifyInstance<
    httpServer,
    IncomingMessage,
    ServerResponse
  >;
  constructor(
    server: FastifyInstance<httpServer, IncomingMessage, ServerResponse>,
    routerSet?: routerSet,
    pluginSet?: pluginSet
  ) {
    this.setOfRouters = routerSet ?? [];
    this.setOfPlugins = pluginSet ?? [];
    this.serverInstace = server;
  }
  public registerPlugin(plugin: plugin) {
    this.setOfPlugins.push(plugin);
  }
  public registerRouter(router: router) {
    this.setOfRouters.push(router);
  }
  private registerPlugins() {
    this.setOfPlugins.forEach((plugin: plugin) => {
      this.serverInstace.register(plugin.pluginInstance, plugin.options);
    });
  }
  private registerRouters() {
    this.setOfRouters.forEach((router: router) => {
      let { routes, opts } = router;
      routes = generalHook.applyGeneralHook(routes);
      const plugin = (
        server: FastifyInstance,
        opts: FastifyPluginOptions,
        done: () => unknown
      ) => {
        routes.forEach((route: RouteOptions) => server.route(route));
        done();
      };
      this.serverInstace.register(plugin, opts);
    });
  }
  public registerApi() {
    this.registerPlugins();
    this.registerRouters();
  }

  public async initLocalDatabases() {
    await initLocalDatabasesIfNotExists();
  }

  public async initServer(port: number, host: string) {
    await this.serverInstace.listen({port, host}, (err, address) => {/** */});
  }
}