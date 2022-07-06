import { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as WS from "ws";
import { IncomingMessage, Server as httpServer, ServerResponse } from "http";
import generalHook from "./utils/generalHook";
import { plugin, pluginSet, router, routerSet } from "./serverTypes";
import { RouteOptions } from "@fastify/websocket";
import { socketRegistry, lobbyManager } from "../projectDependencies";
import joinHandler from "../socket/joinHandler";
import disconnectHandler from "../socket/disconnectHandler";
import chatHandler from "../socket/chatHandler";
import startHandler from "../socket/startHandler";
import lobbyConnectionHandler from "../socket/lobbyConnectionHandler";
import { lobbyEvent } from "../socket/types/lobbyEvent";
import { initLocalDatabasesIfNotExists } from "../dataSources/initLocalDatabases";

export default class Server {
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
  public getWebsocketServer(): WS.Server {
    return this.serverInstance.websocketServer;
  }
  public registerPlugin(plugin: plugin): void {
    this.setOfPlugins.push(plugin);
  }
  public registerRouter(router: router): void {
    this.setOfRouters.push(router);
  }
  private registerPlugins() {
    this.setOfPlugins.forEach((plugin: plugin) => {
      this.serverInstance.register(plugin.pluginInstance, plugin.options);
    });
  }
  private registerRouters() {
    this.setOfRouters.forEach((router: router) => {
      let routes = router.routes;
      const opts = router.opts;
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
  public registerApi(): void {
    this.registerPlugins();
    this.registerRouters();
  }

  public async initServer(port: number, host: string): Promise<void> {
    await this.serverInstance.listen({ port, host });
  }

  public async initLocalDatabases(): Promise<void> {
    await initLocalDatabasesIfNotExists();
  }

  public initFastifyWebsocketServer(): void {
    this.serverInstance.websocketServer.on(
      "connection",
      (socket: WS.WebSocket) => {
        console.log("Connected");
        socket.on("message", (message) => {
          try {
            const msg = JSON.parse(message.toString());
            if (msg.request) {
              console.log(msg.request.method);
              socket.emit(msg.request.method, msg.request.body);
            } else if (msg.response) {
              socket.send(msg);
            } else
              socket.send({ response: { error: "Wrong socket message body" } });
          } catch (e: any) {
            console.log(e.message);
            socket.send({ response: { error: e.message } });
          }
        });
        const handlers = [
          new disconnectHandler(socket),
          new chatHandler(socket),
          new joinHandler(socket),
          new startHandler(socket),
          new lobbyConnectionHandler(socket),
        ];
        for (const handler of handlers) handler.init();
        socket.on("close", () => {
          for (const handler of handlers) handler.destroy();
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
        console.log(
          JSON.stringify(`Send ${clientId} ${eventName} with args ${args}`)
        );
        socket.emit(eventName, ...args);
        return true;
      } else {
        return false;
      }
    };

    lobbyManager.onJoin((clientId, lobby) => {
      sendEvent(clientId, lobbyEvent.USER_JOIN, lobby);
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

    lobbyManager.onStart((clientId, lobby) => {
      sendEvent(clientId, lobbyEvent.START, lobby);
    });
  }
}
