import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import {chatMessageHandlerBody} from "~/socket/types/wsInterface";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";

export default class chatHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #sendMessageListener = async (body: chatMessageHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    lobbyManager.sendMessageToLobby({...body, clientId: <string>clientId});
  };

  readonly #receiveMessageListener = async (
    senderId: string,
    message: string
  ) => {
    this.#socket.send(socketMessageManager.generateString({senderId: senderId, message: message}));
  };

  init(): void {
    this.#socket.on(lobbyEvent.SEND_MESSAGE, this.#sendMessageListener);
    this.#socket.on(lobbyEvent.RECEIVE_MESSAGE, this.#receiveMessageListener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.SEND_MESSAGE, this.#sendMessageListener);
    this.#socket.off(lobbyEvent.RECEIVE_MESSAGE, this.#receiveMessageListener);
  }
}
