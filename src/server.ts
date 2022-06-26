import fastify from "fastify";
import { Server } from "./server/server";
import websocketPlugin from "@fastify/websocket";
import * as usersModule from "./modules/usersModule/routers";
import * as quizModule from "./modules/quizModule/routers";
import * as lobbyModule from "./modules/lobbyModule/routers";
import fastifyCors from "@fastify/cors";
import cookie from "@fastify/cookie";

const server = new Server(fastify({ logger: true, exposeHeadRoutes: false }));

server.registerPlugin({ pluginInstance: websocketPlugin, options: {} });
server.registerPlugin({ pluginInstance: cookie, options: { secret: <string>process.env.COOKIE_SECRET } });
server.registerPlugin({ pluginInstance: fastifyCors, options: { "allow-origin": "*" } });

server.registerRouter(usersModule);
server.registerRouter(quizModule);
server.registerRouter(lobbyModule);

server.registerApi();

export default server;