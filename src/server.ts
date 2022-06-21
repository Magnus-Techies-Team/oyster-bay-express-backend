import fastify, { FastifyPluginCallback } from "fastify";
import { Server } from "./server/server";
import websocketPlugin from "@fastify/websocket";
import * as usersModule from "./modules/usersModule/routers";
import * as quizModule from "./modules/quizModule/routers";
import cookie from "@fastify/cookie";


const server = new Server(fastify({ logger: true }));

server.registerPlugin({ pluginInstance: websocketPlugin, options: {} });
server.registerPlugin({ pluginInstance: cookie, options: { secret: <string>process.env.COOKIE_SECRET }});
server.registerRouter(usersModule);
server.registerRouter(quizModule);
server.registerApi();

export default server;