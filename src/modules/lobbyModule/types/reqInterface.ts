import {
  RequestBodyDefault,
  RequestHeadersDefault,
  RequestQuerystringDefault,
  RequestGenericInterface,
  RequestParamsDefault,
} from "fastify";
import { ReplyGenericInterface } from "fastify/types/reply";

interface RequestGenericInterfaceCreateLobby {
  Body?: RequestBodyDefault;
  Querystring?: RequestQuerystringDefault;
  Params: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

interface RequestGenericInterfaceLobbyAction {
  Body?: RequestBodyDefault;
  Querystring: {
    lobbyId: string;
  };
  Params: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

export interface RouteGenericInterfaceCreateLobby
  extends RequestGenericInterfaceCreateLobby,
    ReplyGenericInterface {}

export interface RouteGenericInterfaceLobbyAction
  extends RequestGenericInterfaceLobbyAction,
    ReplyGenericInterface {}
