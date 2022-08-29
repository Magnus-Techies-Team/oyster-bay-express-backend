import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";
import {
  createLobbyHandlerBody, defaultActionHandlerBody,
} from "~/socket/types/wsInterface";
import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {LobbyMethod} from "~/socket/types/lobbyMethod";

export default class lobbyConnectionHandler {
  readonly #socket: WebSocket;
  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #createLobbyListener = async (body: createLobbyHandlerBody) => {
    const hostId = socketRegistry.getClientId(this.#socket);
    const lobby = await lobbyManager.createLobby(body.quizId, <string>hostId);
    this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
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
    if (lobby.error) this.#socket.send(socketMessageManager.generateString({error: lobby.error}));
    this.#socket.send(socketMessageManager.generateString({lobby: lobby}));
  };

  readonly #userJoinListener = async (lobby: Lobby) => {
    // console.log(lobby.users);
    this.#socket.send(socketMessageManager.generateString({lobby: lobby}));
  };

  init(): void {
    this.#socket.on(LobbyMethod.CREATE_LOBBY, this.#createLobbyListener);
    this.#socket.on(LobbyMethod.JOIN_LOBBY, this.#joinLobbyListener);
    this.#socket.on(LobbyMethod.SPECTATE_LOBBY, this.#spectateLobbyListener);
    this.#socket.on(lobbyEvent.USER_JOIN, this.#userJoinListener);
  }

  destroy(): void {
    this.#socket.off(LobbyMethod.CREATE_LOBBY, this.#createLobbyListener);
    this.#socket.off(LobbyMethod.JOIN_LOBBY, this.#joinLobbyListener);
    this.#socket.off(LobbyMethod.SPECTATE_LOBBY, this.#spectateLobbyListener);
    this.#socket.off(lobbyEvent.USER_JOIN, this.#userJoinListener);
  }
}
