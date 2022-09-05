import {
  RequestBodyDefault,
  RequestHeadersDefault,
  RequestParamsDefault, RequestQuerystringDefault,
} from "fastify";
import { ReplyGenericInterface } from "fastify/types/reply";

interface RequestGenericInterfaceGetAllLobbies {
  Body?: RequestBodyDefault;
  Querystring?: RequestQuerystringDefault;
  Params?: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

interface RequestGenericInterfaceGetCurrentLobby {
  Body?: RequestBodyDefault;
  Querystring?: RequestQuerystringDefault;
  Params: {
    lobbyId: string;
  };
  Headers?: RequestHeadersDefault;
}

export interface RouteGenericInterfaceGetAllLobbies
  extends RequestGenericInterfaceGetAllLobbies,
    ReplyGenericInterface {}

export interface RouteGenericInterfaceGetCurrentLobby
    extends RequestGenericInterfaceGetCurrentLobby,
        ReplyGenericInterface {}