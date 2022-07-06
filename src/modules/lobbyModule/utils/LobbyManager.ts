import {
  ANSWER_QUESTION_TIMEOUT,
  disconnectLobbyStatus,
  joinLobbyStatus,
  lobbyStatus,
  MAX_PLAYER_COUNT,
  MIN_PLAYER_COUNT,
  QUESTION_CANCEL_TIMEOUT,
  startLobbyStatus,
} from "../types/lobbyConstants";
import { EventEmitter } from "events";
import { Lobby } from "../types/lobby";
import { lobbyEvent } from "../../../socket/types/lobbyEvent";
import TimeoutTimer from "../../../utils/TimeoutTimer";

export type clientEventHandler = (clientId: string) => void;

export default class LobbyManager {
  #event = new EventEmitter();
  #playersToAnswer = new TimeoutTimer(ANSWER_QUESTION_TIMEOUT);
  #questionsToCancel = new TimeoutTimer(QUESTION_CANCEL_TIMEOUT);
  readonly #lobbies = new Map<string, Lobby>();

  #emitEventForLobby(lobby: Lobby, event: lobbyEvent, ...args: any[]) {
    const users = [{ id: lobby.hostId }, ...lobby.users];
    for (const user of users) {
      this.#event.emit(event, user.id, ...args);
    }
  }

  createLobby(quizId: string, hostId: string): string | any {
    // const lobbyId = uuid();
    for (const lobby of this.#lobbies.values())
      if (lobby.hostId === hostId)
        return { error: joinLobbyStatus.ALREADY_IN_GAME } as any;
    const lobbyId = "41d524a8-d2ef-4677-9dc9-0e5d949ff048";
    this.#lobbies.set(lobbyId, {
      id: lobbyId,
      hostId: hostId,
      users: [],
      quizId: quizId,
      maxPlayers: MAX_PLAYER_COUNT,
      state: lobbyStatus.WAITING,
    });
    return this.#lobbies.get(lobbyId);
  }

  joinLobby(clientId: string, lobbyId: string): string | any {
    const lobby = this.#lobbies.get(lobbyId);
    console.log(lobby);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.hostId === clientId) {
      return { error: joinLobbyStatus.HOST_IN_GAME } as any;
    }
    if (lobby.users.some((user) => user.id === clientId)) {
      return { error: joinLobbyStatus.ALREADY_JOINED } as any;
    }
    if (lobby.users.length === lobby.maxPlayers) {
      return { error: joinLobbyStatus.LOBBY_IS_FULL } as any;
    }
    lobby.users.push({ id: clientId, points: 0 });
    this.#emitEventForLobby(lobby, lobbyEvent.USER_JOIN, lobby);
    return lobby;
  }

  disconnectLobby(lobbyId: string, clientId: string): void | any {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: disconnectLobbyStatus.GAME_NOT_FOUND };
    }
    if (clientId === lobby.hostId) {
      for (const user of lobby.users) {
        this.#event.emit(lobbyEvent.HOST_DISCONNECT, user.id);
      }
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#lobbies.delete(lobbyId);
      return { message: `Lobby with id ${lobbyId} deleted.` };
    } else if (lobby.users.some((user) => user.id === clientId)) {
      lobby.users = lobby.users.filter((user) => user.id !== clientId);
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#event.emit(lobbyEvent.USER_DISCONNECT, lobby.hostId, clientId);
      for (const user of lobby.users) {
        this.#event.emit(lobbyEvent.USER_DISCONNECT, user.id, clientId);
      }
      return lobby;
    } else {
      return { error: disconnectLobbyStatus.USER_NOT_FOUND };
    }
  }

  public startLobby(lobbyId: string, clientId: string): Lobby | any {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.hostId !== clientId) {
      return { error: startLobbyStatus.NOT_HOST } as any;
    }
    if (lobby.users.length < MIN_PLAYER_COUNT) {
      return { error: startLobbyStatus.NOT_ENOUGH_PLAYERS } as any;
    }
    lobby.state = lobbyStatus.STARTED;
    this.#emitEventForLobby(lobby, lobbyEvent.START, lobby);
    return lobby;
  }

  public sendMessageToLobby(
    senderId: string,
    message: string,
    lobbyId: string
  ): void {
    const lobby = this.#lobbies.get(lobbyId);
    // this.#event.emit(lobbyEvent.RECEIVE_MESSAGE, lobby!.hostId, senderId, message);
    // for (let user of lobby!.users) {
    //     this.#event.emit(lobbyEvent.RECEIVE_MESSAGE, user.id, senderId, message);
    // }
    this.#emitEventForLobby(
      <Lobby>lobby,
      lobbyEvent.RECEIVE_MESSAGE,
      senderId,
      message
    );
  }

  // public takeQuestion() {
  //   //
  // }

  onJoin(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.USER_JOIN, handler);
  }

  onDisconnect(handler: clientEventHandler): void {
    this.#event.on(lobbyEvent.DISCONNECT, handler);
  }

  onUserDisconnect(
    handler: (clientId: string, deletedClientId: string) => void
  ): void {
    this.#event.on(lobbyEvent.USER_DISCONNECT, handler);
  }

  onHostDisconnect(handler: clientEventHandler): void {
    this.#event.on(lobbyEvent.HOST_DISCONNECT, handler);
  }

  onChat(
    handler: (clientId: string, senderId: string, message: string) => void
  ): void {
    this.#event.on(lobbyEvent.RECEIVE_MESSAGE, handler);
  }

  onStart(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.START, handler);
  }
}
