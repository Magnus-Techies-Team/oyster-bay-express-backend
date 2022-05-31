import {
  onErrorHookHandler,
  onErrorAsyncHookHandler,
  onRequestHookHandler,
  onRequestAsyncHookHandler,
  onResponseHookHandler,
  onResponseAsyncHookHandler,
  onSendHookHandler,
  onSendAsyncHookHandler,
  preHandlerHookHandler,
  preHandlerAsyncHookHandler,
  preParsingHookHandler,
  preParsingAsyncHookHandler,
  preSerializationHookHandler,
  preSerializationAsyncHookHandler,
  preValidationHookHandler,
  preValidationAsyncHookHandler,
} from "fastify";

export type hookHandler =
  | onRequestHookHandler
  | preParsingHookHandler
  | preValidationHookHandler
  | preHandlerHookHandler
  | preSerializationHookHandler<unknown>
  | onErrorHookHandler
  | onSendHookHandler<unknown>
  | onResponseHookHandler;

export type hookHandlerAsync =
  | onErrorAsyncHookHandler
  | onRequestAsyncHookHandler
  | onResponseAsyncHookHandler
  | onSendAsyncHookHandler<unknown>
  | preHandlerAsyncHookHandler
  | preParsingAsyncHookHandler
  | preSerializationAsyncHookHandler<unknown>
  | preValidationAsyncHookHandler;