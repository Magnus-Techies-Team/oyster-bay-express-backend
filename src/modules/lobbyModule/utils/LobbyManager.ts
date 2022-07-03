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
    // this.#event.emit(event, lobby.hostId, ...args);
    for (let user of users) {
      console.log(user);
      this.#event.emit(event, user.id, ...args);
    }
  }

  createLobby(quizId: string, hostId: string) {
    // const lobbyId = uuid();
    for (let lobby of this.#lobbies.values())
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

  joinLobby(clientId: string, lobbyId: string) {
    // TODO: check, if user is valid via UUID
    const lobby = this.#lobbies.get(lobbyId);
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
    // this.#event.emit(lobbyEvent.JOIN, lobby.hostId, clientId);
    // for (let user of lobby.users) {
    //     this.#event.emit(lobbyEvent.JOIN, user.id, clientId);
    // }
    lobby.users.push({ id: clientId, points: 0 });
    this.#emitEventForLobby(lobby, lobbyEvent.USER_JOIN, lobby);
  }

  disconnectLobby(lobbyId: string, clientId: string) {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: disconnectLobbyStatus.GAME_NOT_FOUND };
    }
    if (clientId === lobby.hostId) {
      for (let user of lobby.users) {
        this.#event.emit(lobbyEvent.HOST_DISCONNECT, user.id);
      }
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#lobbies.delete(lobbyId);
      return { message: `Lobby with id ${lobbyId} deleted.` };
    } else if (lobby.users.some((user) => user.id === clientId)) {
      lobby.users = lobby.users.filter((user) => user.id !== clientId);
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#event.emit(lobbyEvent.USER_DISCONNECT, lobby.hostId, clientId);
      for (let user of lobby.users) {
        this.#event.emit(lobbyEvent.USER_DISCONNECT, user.id, clientId);
      }
      return lobby;
    } else {
      return { error: disconnectLobbyStatus.USER_NOT_FOUND };
    }
  }

  public sendMessageToLobby(
    senderId: string,
    message: string,
    lobbyId: string
  ) {
    const lobby = this.#lobbies.get(lobbyId);
    // this.#event.emit(lobbyEvent.RECEIVE_MESSAGE, lobby!.hostId, senderId, message);
    // for (let user of lobby!.users) {
    //     this.#event.emit(lobbyEvent.RECEIVE_MESSAGE, user.id, senderId, message);
    // }
    this.#emitEventForLobby(
      lobby!,
      lobbyEvent.RECEIVE_MESSAGE,
      senderId,
      message
    );
  }

  public startLobby(lobbyId: string, clientId: string) {
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

  public takeQuestion() {
    //
  }

  onJoin(handler: (clientId: string, lobby: Lobby) => void) {
    this.#event.on(lobbyEvent.USER_JOIN, handler);
  }

  onDisconnect(handler: clientEventHandler) {
    this.#event.on(lobbyEvent.DISCONNECT, handler);
  }

  onUserDisconnect(
    handler: (clientId: string, deletedClientId: string) => void
  ) {
    this.#event.on(lobbyEvent.USER_DISCONNECT, handler);
  }

  onHostDisconnect(handler: clientEventHandler) {
    this.#event.on(lobbyEvent.HOST_DISCONNECT, handler);
  }

  onChat(
    handler: (clientId: string, senderId: string, message: string) => void
  ) {
    this.#event.on(lobbyEvent.RECEIVE_MESSAGE, handler);
  }

  onStart(handler: clientEventHandler) {
    this.#event.on(lobbyEvent.START, handler);
  }
}
