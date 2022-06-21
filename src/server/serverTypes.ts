import {
  FastifyPlugin,
  FastifyPluginCallback,
  FastifyPluginOptions,
  RegisterOptions,
} from "fastify";
import { RouteOptions } from "@fastify/websocket";

export type routerSet = { opts: RegisterOptions; routes: RouteOptions[] }[];
export type pluginSet = {
  pluginInstance: FastifyPluginCallback;
  options: FastifyPluginOptions;
}[];

export type router = { opts: RegisterOptions; routes: RouteOptions[] };
export type plugin = {
  pluginInstance: FastifyPluginCallback;
  options: FastifyPluginOptions;
};