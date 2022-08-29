import { WebSocket } from "ws";
import { LobbyEvent } from "~/socket/types/lobbyEvent";
import {chatMessageHandlerBody, defaultHandlerResponse} from "~/socket/types/wsInterface";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";
import {LobbyMethod} from "~/socket/types/lobbyMethod";

export default class chatHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #sendMessageListener = async (body: chatMessageHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    lobbyManager.sendMessageToLobby({...body, clientId: <string>clientId});
  };

  readonly #receiveMessageListener = async (body: defaultHandlerResponse & {senderId: string, message: string}) => {
    this.#socket.send(socketMessageManager.generateString(body));
  };

  init(): void {
    this.#socket.on(LobbyMethod.SEND_MESSAGE, this.#sendMessageListener);
    this.#socket.on(LobbyEvent.RECEIVE_MESSAGE, this.#receiveMessageListener);
  }

  destroy(): void {
    this.#socket.off(LobbyMethod.SEND_MESSAGE, this.#sendMessageListener);
    this.#socket.off(LobbyEvent.RECEIVE_MESSAGE, this.#receiveMessageListener);
  }
}
