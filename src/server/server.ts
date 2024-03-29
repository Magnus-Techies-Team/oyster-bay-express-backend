import {FastifyInstance, FastifyPluginOptions} from "fastify";
import * as WS from "ws";
import {IncomingMessage, Server as httpServer, ServerResponse} from "http";
import generalHook from "~/server/utils/generalHook";
import {plugin, pluginSet, router, routerSet} from "~/server/serverTypes";
import {RouteOptions} from "@fastify/websocket";
import {lobbyManager, socketRegistry} from "~/projectDependencies";
import {LobbyEvent} from "~/socket/types/lobbyEvent";
import {initLocalDatabasesIfNotExists} from "~/dataSources/initLocalDatabases";
import disconnectHandler from "~/socket/disconnectHandler";
import chatHandler from "~/socket/chatHandler";
import startHandler from "~/socket/startHandler";
import lobbyConnectionHandler from "~/socket/lobbyConnectionHandler";
import gameEventsHandler from "~/socket/gameEventsHandlers";

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
          new startHandler(socket),
          new lobbyConnectionHandler(socket),
          new gameEventsHandler(socket),
        ];
        for (const handler of handlers) handler.init();
        socket.on("close", () => {
          for (const handler of handlers) handler.destroy();
        });
      }
    );

    const sendEvent = (
      clientId: string,
      eventName: LobbyEvent,
      ...args: any[]
    ) => {
      const socket = socketRegistry.getSocket(clientId);
      if (socket) {
        // console.log(
        //   JSON.stringify(`Send ${clientId} ${eventName} with args ${JSON.stringify(args)}`)
        // );
        socket.emit(eventName, ...args);
        return true;
      } else {
        return false;
      }
    };

    lobbyManager.onJoin((clientId, lobby, currentUser) => {
      sendEvent(clientId, LobbyEvent.USER_JOIN, lobby, currentUser);
    });

    lobbyManager.onDisconnect((clientId) => {
      sendEvent(clientId, LobbyEvent.DISCONNECT);
    });

    lobbyManager.onUserDisconnect((clientId, deletedClientId) => {
      sendEvent(clientId, LobbyEvent.USER_DISCONNECT, deletedClientId);
    });

    lobbyManager.onHostDisconnect((clientId) => {
      sendEvent(clientId, LobbyEvent.HOST_DISCONNECT);
    });

    lobbyManager.onChat((clientId, senderId, message) => {
      sendEvent(clientId, LobbyEvent.RECEIVE_MESSAGE, senderId, message);
    });

    lobbyManager.onStart((clientId, lobby, currentUser) => {
      sendEvent(clientId, LobbyEvent.START, lobby, currentUser);
    });

    lobbyManager.onSetQuestion((clientId, lobby, currentUser) => {
      sendEvent(clientId, LobbyEvent.HOST_SET_QUESTION, lobby, currentUser);
    });

    lobbyManager.onValidatedAnswer((clientId, lobby, actionInfo, currentUser) => {
      sendEvent(clientId, LobbyEvent.HOST_VALIDATED_ANSWER, lobby, actionInfo, currentUser);
    });

    lobbyManager.onTakeQuestion((clientId, lobby, currentUser) => {
      sendEvent(clientId, LobbyEvent.PLAYER_TAKE_QUESTION, lobby, currentUser);
    });

    lobbyManager.onSwitchRound((clientId, lobby, currentUser) => {
      sendEvent(clientId, LobbyEvent.SWITCH_ROUND, lobby, currentUser);
    });

    lobbyManager.onEndLobby((clientId, lobby, winner, currentUser, ) => {
      sendEvent(clientId, LobbyEvent.END_LOBBY, lobby, winner, currentUser);
    });
  }
}
