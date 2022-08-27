import {
  ANSWER_QUESTION_TIMEOUT,
  disconnectLobbyStatus,
  gameStatus,
  joinLobbyStatus,
  lobbyStatus,
  MAX_PLAYER_COUNT,
  MIN_PLAYER_COUNT,
  QUESTION_CANCEL_TIMEOUT,
  questionStatus,
  startLobbyStatus,
  validateStatus,
} from "../types/lobbyConstants";
import {EventEmitter} from "events";
import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {lobbyEvent} from "~/socket/types/lobbyEvent";
import TimeoutTimer from "~/utils/TimeoutTimer";
import {chatActionHandlerBody, questionHandlerBody,} from "~/socket/types/wsInterface";
import {uuid} from "uuidv4";

export type clientEventHandler = (clientId: string) => void;

export default class LobbyManager {
  #event = new EventEmitter();
  #playersToAnswer = new TimeoutTimer(ANSWER_QUESTION_TIMEOUT);
  #questionsToCancel = new TimeoutTimer(QUESTION_CANCEL_TIMEOUT);
  readonly #lobbies = new Map<string, Lobby>();

  #emitEventForLobby(lobby: Lobby, event: lobbyEvent, ...args: any[]) {
    const users = [lobby.hostId , ...lobby.users.keys()];
    for (const userId of users) {
      this.#event.emit(event, userId, ...args);
    }
  }

  getLobby(lobbyId?: string): Lobby | any {
    let result;
    if (lobbyId) result = this.#lobbies.get(lobbyId);
    else result = this.#lobbies;
    if (!result) return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    else return result;
  }

  createLobby(quizId: string, hostId: string): string | any {
    const lobbyId = uuid();
    for (const lobby of this.#lobbies.values())
      if (lobby.hostId === hostId)
        return { error: joinLobbyStatus.ALREADY_IN_GAME } as any;
    this.#lobbies.set(lobbyId, {
      id: lobbyId,
      hostId: hostId,
      users: new Map<string, number>(),
      quizId: quizId,
      maxPlayers: MAX_PLAYER_COUNT,
      state: lobbyStatus.WAITING,
      currentRound: undefined,
      currentQuestion: undefined,
      quiz: undefined,
      assignee: undefined,
    });
    return this.#lobbies.get(lobbyId);
  }

  joinLobby(clientId: string, lobbyId: string): string | any {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.hostId === clientId) {
      return { error: joinLobbyStatus.HOST_IN_GAME } as any;
    }
    if (lobby.users.has(clientId)) {
      return { error: joinLobbyStatus.ALREADY_JOINED } as any;
    }
    if (lobby.users.size === lobby.maxPlayers) {
      return { error: joinLobbyStatus.LOBBY_IS_FULL } as any;
    }
    lobby.users.set(clientId, 0);
    console.log(lobby);
    this.#emitEventForLobby(lobby, lobbyEvent.USER_JOIN, lobby);
    return lobby;
  }

  disconnectLobby(lobbyId: string, clientId: string): void | any {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: disconnectLobbyStatus.GAME_NOT_FOUND };
    }
    if (clientId === lobby.hostId) {
      for (const userId of lobby.users.keys()) {
        this.#event.emit(lobbyEvent.HOST_DISCONNECT, userId);
      }
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#lobbies.delete(lobbyId);
      return { message: `Lobby with id ${lobbyId} deleted.` };
    } else if (lobby.users.has(clientId)) {
      lobby.users.delete(clientId);
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#emitEventForLobby(lobby, lobbyEvent.USER_DISCONNECT, clientId);
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
    if (lobby.users.size < MIN_PLAYER_COUNT) {
      return { error: startLobbyStatus.NOT_ENOUGH_PLAYERS } as any;
    }
    lobby.state = lobbyStatus.STARTED;
    lobby.currentRound = 0;
    this.#emitEventForLobby(lobby, lobbyEvent.START, lobby);
    return lobby;
  }

  public sendMessageToLobby(body: chatActionHandlerBody): void {
    const lobby = this.#lobbies.get(body.lobbyId);
    this.#emitEventForLobby(
      <Lobby>lobby,
      lobbyEvent.RECEIVE_MESSAGE,
      body.clientId,
      body.message
    );
  }

  public setQuestion(
    body: questionHandlerBody & { questionId: string }
  ): void | any {
    const lobby = this.#lobbies.get(body.lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.hostId !== body.clientId) {
      return { error: startLobbyStatus.NOT_HOST } as any;
    }
    // lobby.currentQuestion
  }

  public takeQuestion(body: questionHandlerBody): void | any {
    const lobby = this.#lobbies.get(body.lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.hostId === body.clientId) {
      return { error: gameStatus.NO_HOST_QUESTION } as any;
    }
    if (lobby.currentQuestion === undefined) {
      return { error: gameStatus.NO_ACTIVE_QUESTION } as any;
    }
    if (lobby.assignee) {
      return { error: gameStatus.QUESTION_ALREADY_TAKEN } as any;
    }
    lobby.currentQuestion!.questionStatus = questionStatus.ACTIVE;
    lobby.assignee = body.clientId;
    // TODO: emit event for take question
    return lobby;
  }

  public answerQuestion(body: questionHandlerBody & { answer: string }): any {
    const lobby = this.#lobbies.get(body.lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.hostId === body.clientId) {
      return { error: gameStatus.NO_HOST_QUESTION } as any;
    }
    if (lobby.currentQuestion === undefined) {
      return { error: gameStatus.NO_ACTIVE_QUESTION } as any;
    }
    // TODO: emit event for answer
  }

  public validateAnswer(body: questionHandlerBody & { isRight: validateStatus }): any {
    const lobby = this.#lobbies.get(body.lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.hostId === body.clientId) {
      return { error: gameStatus.NO_HOST_QUESTION } as any;
    }
    if (lobby.assignee === undefined) {
      return { error: gameStatus.NO_ACTIVE_QUESTION } as any;
    }
    if (body.isRight === validateStatus.CORRECT)
      lobby.users.set(lobby.assignee, (lobby.users.get(lobby.assignee) as number - lobby.currentQuestion!.cost));
    else
      lobby.users.set(lobby.assignee, (lobby.users.get(lobby.assignee) as number + lobby.currentQuestion!.cost));
    const actionInfo = {
      playerId: lobby.assignee,
      questionId: lobby.currentQuestion!.id,
      playerScore: lobby.users.get(lobby.assignee),
      isRight: body.isRight,
    };
    lobby.currentQuestion!.questionStatus = questionStatus.TAKEN;
    lobby.currentQuestion = undefined;
    lobby.assignee = undefined;
    // TODO: emit event for validation
    // TODO: check, if last question, then emit event for next round
    return {actionInfo: actionInfo, lobby: lobby};
  }

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

  onSetQuestion(handler: () => void):void {
    this.#event.on(lobbyEvent.SET_QUESTION, handler);
  }

  onTakeQuestion(handler: () => void): void {
    this.#event.on(lobbyEvent.TAKE_QUESTION, handler);
  }

  onAnswerQuestion(handler: () => void): void {
    this.#event.on(lobbyEvent.ANSWER_QUESTION, handler);
  }

  onSwitchRound(handler: () => void): void {
    this.#event.on(lobbyEvent.SWITCH_ROUND, handler);
  }

  onEndLobby(handler: () => void): void {
    this.#event.on(lobbyEvent.END_LOBBY, handler);
  }
}
