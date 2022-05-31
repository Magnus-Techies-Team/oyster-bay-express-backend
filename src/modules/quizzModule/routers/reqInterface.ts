import {
  RequestBodyDefault,
  RequestHeadersDefault,
  RequestQuerystringDefault,
  RequestGenericInterface,
  RequestParamsDefault
} from "fastify";
import { ReplyGenericInterface } from "fastify/types/reply";

interface RequestGenericInterfaceCreateQuizz {
  Body: {
  
  };
  Querystring?: RequestQuerystringDefault;
  Params: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

export interface RouteGenericInterfaceQuizz extends RequestGenericInterfaceCreateQuizz, ReplyGenericInterface {}