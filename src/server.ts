import fastify, { FastifyPluginCallback } from "fastify";
import { Server } from "./server/server";
import websocketPlugin from "@fastify/websocket";
import * as usersModule from "./modules/usersModule/routers";
import * as quizModule from "./modules/quizModule/routers";
import * as lobbyModule from "./modules/lobbyModule/routers";

const server = new Server(fastify({ logger: true }));

server.registerPlugin({ pluginInstance: websocketPlugin, options: {} });

server.registerRouter(usersModule);
server.registerRouter(quizModule);
server.registerRouter(lobbyModule);

server.registerApi();

export default server;
