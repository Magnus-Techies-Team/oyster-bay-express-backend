import {
  RequestBodyDefault,
  RequestHeadersDefault,
  RequestQuerystringDefault,
  RequestParamsDefault,
} from "fastify";
import { ReplyGenericInterface } from "fastify/types/reply";

interface RequestGenericInterfaceCreateLobby {
  Body?: RequestBodyDefault;
  Querystring?: RequestQuerystringDefault;
  Params: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

interface RequestGenericInterfaceDisconnectLobby {
  Body?: RequestBodyDefault;
  Querystring: {
    clientId: string,
    lobbyId: string
  };
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

export interface RouteGenericInterfaceDisconnectLobby
  extends RequestGenericInterfaceDisconnectLobby,
    ReplyGenericInterface {}