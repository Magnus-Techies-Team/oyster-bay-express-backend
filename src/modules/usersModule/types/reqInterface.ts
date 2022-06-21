import {
  RequestBodyDefault,
  RequestHeadersDefault,
  RequestQuerystringDefault,
  RequestGenericInterface,
  RequestParamsDefault,
} from "fastify";
import { ReplyGenericInterface } from "fastify/types/reply";

interface RequestGenericInterfaceCreateUser {
  Body: {
    login: string;
    email: string;
    password: string;
  };
  Querystring?: RequestQuerystringDefault;
  Params: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

interface RequestGenericInterfaceLogin {
  Body: {
    login: string;
    password: string;
  };
  Querystring?: RequestQuerystringDefault;
  Params: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

export interface RouteGenericInterfaceCreateUser
  extends RequestGenericInterfaceCreateUser,
    ReplyGenericInterface {}

export interface RouteGenericInterfaceLogin
  extends RequestGenericInterfaceCreateUser,
    ReplyGenericInterface {}
  