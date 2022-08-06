import {
  RequestHeadersDefault,
  RequestQuerystringDefault,
  RequestParamsDefault,
  RequestBodyDefault,
} from "fastify";
import { ReplyGenericInterface } from "fastify/types/reply";
import { Quiz } from "./Quiz";

interface RequestGenericInterfaceCreateQuiz {
  Body: Quiz;
  Querystring?: RequestQuerystringDefault;
  Params?: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

export interface RouteGenericInterfaceCreateQuiz
  extends RequestGenericInterfaceCreateQuiz,
    ReplyGenericInterface {}

interface RequestGenericInterfaceGetAllQuiz {
  Body: RequestBodyDefault;
  Quetstring?: RequestQuerystringDefault;
  Params: {
    id: string;
  };
  Headers?: RequestHeadersDefault;
}

export interface RouteGenericInterfaceGetQuizes
  extends RequestGenericInterfaceGetAllQuiz,
    ReplyGenericInterface {}
