import {
  RequestHeadersDefault,
  RequestQuerystringDefault,
  RequestParamsDefault,
} from "fastify";
import { ReplyGenericInterface } from "fastify/types/reply";
import { Quiz } from "./Quiz";

interface RequestGenericInterfaceCreateQuiz {
  Body: Quiz;
  Querystring?: RequestQuerystringDefault;
  Params: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
}

export interface RouteGenericInterfaceCreateQuiz
  extends RequestGenericInterfaceCreateQuiz,
    ReplyGenericInterface {}
