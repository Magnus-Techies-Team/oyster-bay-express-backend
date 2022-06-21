import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { IncomingMessage, Server as httpServer, ServerResponse } from "http";
import generalHook from "./utils/generalHook";
import { plugin, pluginSet, router, routerSet } from "./serverTypes";
import { initLocalDatabasesIfNotExists } from "../dataSources/initLocalDatabases";
import { RouteOptions } from "@fastify/websocket";
import socketRegistry from "../socket/socketRegistry";
import { WebSocket } from "ws";
import joinHandler from "../socket/joinHandler";
import { lobbyEvent } from "../socket/types/lobbyEvent";
import lobbyManager from "../modules/lobbyModule/utils/lobbyManager";
import disconnectHandler from "../socket/disconnectHandler";
import chatHandler from "../socket/chatHandler";

export class Server {
  private setOfRouters: routerSet;
  private setOfPlugins: pluginSet;
  private serverInstance: FastifyInstance<
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
    this.serverInstance = server;
  }
  public getWebsocketServer() {
    return this.serverInstance.websocketServer;
  }
  public registerPlugin(plugin: plugin) {
    this.setOfPlugins.push(plugin);
  }
  public registerRouter(router: router) {
    this.setOfRouters.push(router);
  }
  private registerPlugins() {
    this.setOfPlugins.forEach((plugin: plugin) => {
      this.serverInstance.register(plugin.pluginInstance, plugin.options);
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
      this.serverInstance.register(plugin, opts);
    });
  }
  public registerApi() {
    this.registerPlugins();
    this.registerRouters();
  }

  public async initLocalDatabases() {
    await initLocalDatabasesIfNotExists();
  }

  public async initServer(port: string, host: string) {
    await this.serverInstance.listen(port, host);
  }

  public initFastifyWebsocketServer() {
    let counter = -1;
    this.serverInstance.websocketServer.on(
      "connection",
      (socket: WebSocket) => {
        counter++;
        console.log("Connected");
        // const clientId = uuid();
        const clientIds = [
          "cf38d00f-35e0-4032-88cf-9b45980d9e3d",
          "1ecc3dc4-2c44-4534-9034-ed5cc026c8b2",
          "4101e92e-0382-4acf-a162-80cddda92a58",
          "cc95d2b0-82fb-45f8-88a2-2da7796e696c",
        ];
        socketRegistry.add(socket, clientIds[counter]);
        const handlers = [
          new joinHandler(socket),
          new disconnectHandler(socket),
          new chatHandler(socket),
        ];
        for (let handler of handlers) handler.init();
        socket.on("close", () => {
          for (let handler of handlers) handler.destroy();
          socketRegistry.remove(socket);
        });
      }
    );

    const sendEvent = (
      clientId: string,
      eventName: lobbyEvent,
      ...args: any[]
    ) => {
      const socket = socketRegistry.getSocket(clientId);
      if (socket) {
        console.log("Socket found!");
        console.log(`Send ${clientId} ${eventName} with args ${args}`);
        socket.emit(eventName, ...args);
        return true;
      } else {
        return false;
      }
    };

    lobbyManager.onJoin((clientId, newClientId) => {
      sendEvent(clientId, lobbyEvent.JOIN, newClientId);
    });

    lobbyManager.onDisconnect((clientId) => {
      sendEvent(clientId, lobbyEvent.DISCONNECT);
    });

    lobbyManager.onUserDisconnect((clientId, deletedClientId) => {
      sendEvent(clientId, lobbyEvent.USER_DISCONNECT, deletedClientId);
    });

    lobbyManager.onHostDisconnect((clientId) => {
      sendEvent(clientId, lobbyEvent.HOST_DISCONNECT);
    });

    lobbyManager.onChat((clientId, senderId, message) => {
      sendEvent(clientId, lobbyEvent.RECEIVE_MESSAGE, senderId, message);
    });
  }
}
