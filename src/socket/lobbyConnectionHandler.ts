import { WebSocket } from "ws";
import { LobbyEvent } from "~/socket/types/lobbyEvent";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";
import {
  createLobbyHandlerBody, defaultActionHandlerBody, defaultHandlerResponse,
} from "~/socket/types/wsInterface";
import {LobbyMethod} from "~/socket/types/lobbyMethod";
import {ErrorConstants} from "~/modules/lobbyModule/types/errorConstants";

export default class lobbyConnectionHandler {
  readonly #socket: WebSocket;
  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #createLobbyListener = async (body: createLobbyHandlerBody) => {
    const hostId = socketRegistry.getClientId(this.#socket);
    const lobby = await lobbyManager.createLobby(body.quizId, <string>hostId);
    this.#socket.send(socketMessageManager.generateString(lobby));
  };

  readonly #joinLobbyListener = async (body: defaultActionHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = await lobbyManager.joinLobby(<string>clientId, body.lobbyId);
    if (lobby && lobby.error)
      this.#socket.send(
        JSON.stringify(
          socketMessageManager.generateString({ error: lobby.error })
        )
      );
  };

  readonly #spectateLobbyListener = async (body: defaultActionHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = await lobbyManager.spectateLobby({...body, clientId: <string>clientId});
    if (!lobby) this.#socket.send(socketMessageManager.generateString({error: ErrorConstants.GAME_NOT_FOUND}));
    else if (lobby && lobby.error) this.#socket.send(socketMessageManager.generateString({error: lobby.error}));
    else this.#socket.send(socketMessageManager.generateString({lobby: lobby}));
  };

  readonly #userJoinListener = async (body: defaultHandlerResponse) => {
    console.log(body);
    this.#socket.send(socketMessageManager.generateString({lobby: body.lobby, currentUser: body.currentUser}));
  };

  init(): void {
    this.#socket.on(LobbyMethod.CREATE_LOBBY, this.#createLobbyListener);
    this.#socket.on(LobbyMethod.JOIN_LOBBY, this.#joinLobbyListener);
    this.#socket.on(LobbyMethod.SPECTATE_LOBBY, this.#spectateLobbyListener);
    this.#socket.on(LobbyEvent.USER_JOIN, this.#userJoinListener);
  }

  destroy(): void {
    this.#socket.off(LobbyMethod.CREATE_LOBBY, this.#createLobbyListener);
    this.#socket.off(LobbyMethod.JOIN_LOBBY, this.#joinLobbyListener);
    this.#socket.off(LobbyMethod.SPECTATE_LOBBY, this.#spectateLobbyListener);
    this.#socket.off(LobbyEvent.USER_JOIN, this.#userJoinListener);
  }
}
