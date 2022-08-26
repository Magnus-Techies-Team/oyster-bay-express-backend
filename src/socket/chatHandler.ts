import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import { chatActionHandlerBody } from "~/socket/types/wsInterface";
import { lobbyManager } from "~/projectDependencies";

export default class chatHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #sendMessageListener = async (body: chatActionHandlerBody) => {
    lobbyManager.sendMessageToLobby(body);
  };

  readonly #receiveMessagelistener = async (
    senderId: string,
    message: string
  ) => {
    this.#socket.send(JSON.stringify(`${senderId}: ${message}`)); // TODO: send message object
  };

  init(): void {
    this.#socket.on(lobbyEvent.SEND_MESSAGE, this.#sendMessageListener);
    this.#socket.on(lobbyEvent.RECEIVE_MESSAGE, this.#receiveMessagelistener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.SEND_MESSAGE, this.#sendMessageListener);
    this.#socket.off(lobbyEvent.RECEIVE_MESSAGE, this.#receiveMessagelistener);
  }
}
