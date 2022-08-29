import {
  ANSWER_QUESTION_TIMEOUT, createLobbyError,
  disconnectLobbyStatus,
  gameStatus,
  joinLobbyStatus,
  lobbyCondition,
  lobbyStatus,
  MAX_PLAYER_COUNT,
  MIN_PLAYER_COUNT,
  QUESTION_CANCEL_TIMEOUT,
  questionStatus,
  startLobbyStatus,
  userState,
  userStatus,
} from "../types/lobbyConstants";
import {EventEmitter} from "events";
import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {lobbyEvent} from "~/socket/types/lobbyEvent";
import TimeoutTimer from "~/utils/TimeoutTimer";
import {
  chatMessageHandlerBody,
  defaultActionHandlerBody,
  questionHandlerBody,
  validateQuestionHandlerBody,
} from "~/socket/types/wsInterface";
// import {uuid} from "uuidv4";
import {quizManager, userManager} from "~/projectDependencies";
import {Question} from "../types/Question";
import {ExtendedUserInfo} from "~/modules/lobbyModule/types/User";

export type clientEventHandler = (clientId: string) => void;
export type ActionInfo = {
  playerId: string,
  questionId: string,
  playerScore: number,
  isRight: boolean,
};

export default class LobbyManager {
  #event = new EventEmitter();
  #playersToAnswer = new TimeoutTimer(ANSWER_QUESTION_TIMEOUT);
  #questionsToCancel = new TimeoutTimer(QUESTION_CANCEL_TIMEOUT);
  readonly #lobbies: {[key:string]:Lobby} = {};

  #emitEventForLobby(lobby: Lobby, event: lobbyEvent, ...args: any[]) {
    const users = [lobby.host.user_id , ...Object.keys(lobby.users), ...[lobby.spectators]];
    for (const userId of users) {
      this.#event.emit(event, userId, ...args);
    }
  }

  getLobby(lobbyId?: string): {[key:string]:Lobby} | Lobby | any {
    let result;
    if (lobbyId) result = this.#lobbies[lobbyId];
    else result = this.#lobbies;
    if (!result) return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    else return result;
  }

  async createLobby(quizId: string, hostId: string): Promise<any> {
    // const lobbyId = uuid();
    const lobbyId = "06c7547f-31f6-4875-8b18-1be5fbe44d00";
    for (const id in this.#lobbies)
      if (this.#lobbies[id].host.user_id === hostId)
        return { error: joinLobbyStatus.ALREADY_IN_GAME } as any;
    const host = await userManager.getUser(hostId);
    const quiz = await quizManager.getQuizQuestions(hostId, quizId);
    if (quiz.error) {
      return { error: createLobbyError.QUIZ_NOT_FOUND } as any;
    }
    this.#lobbies[lobbyId] = {
      id: lobbyId,
      host: {user_id: hostId, user_name: host.login, state: userState.CONNECTED, status: userStatus.HOST},
      users: {},
      spectators: {},
      quizId: quizId,
      maxPlayers: MAX_PLAYER_COUNT,
      state: lobbyStatus.WAITING,
      quiz: { title: quiz.title, rounds: quiz.rounds},
      currentRound: undefined,
      currentQuestion: undefined,
      assignee: undefined,
    };
    return this.#lobbies[lobbyId];
  }

  async spectateLobby(body: defaultActionHandlerBody & {clientId: string}): Promise<any> {
    const lobby = this.#lobbies[body.lobbyId];
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id === body.clientId) {
      return { error: joinLobbyStatus.HOST_IN_GAME } as any;
    }
    if (lobby.users[body.clientId]) {
      return { error: joinLobbyStatus.ALREADY_JOINED } as any;
    }
    const user = await userManager.getUser(body.clientId);
    lobby.spectators[body.clientId] = ({user_id: body.clientId, user_name: user.login, state: userState.CONNECTED, status: userStatus.SPECTATOR});
    return lobby;
  }

  async joinLobby(clientId: string, lobbyId: string): Promise<any> {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id === clientId) {
      return { error: joinLobbyStatus.HOST_IN_GAME } as any;
    }
    if (lobby.users[clientId]) {
      return { error: joinLobbyStatus.ALREADY_JOINED } as any;
    }
    if (Object.keys(lobby.users).length === lobby.maxPlayers) {
      return { error: joinLobbyStatus.LOBBY_IS_FULL } as any;
    }
    if (lobby.state === lobbyStatus.STARTED) {
      return { error: joinLobbyStatus.GAME_ALREADY_STARTED} as any;
    }
    const user = await userManager.getUser(clientId);
    lobby.users[clientId] = {user_id: clientId, user_name: user.login, points: 0, status: userStatus.PLAYER, state: userState.CONNECTED};
    this.#emitEventForLobby(lobby, lobbyEvent.USER_JOIN, lobby);
    // return lobby;
  }

  public disconnectLobby(lobbyId: string, clientId: string): void | any {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) {
      return { error: disconnectLobbyStatus.GAME_NOT_FOUND };
    }
    if (clientId === lobby.host.user_id) {
      for (const userId in lobby.users) {
        this.#event.emit(lobbyEvent.HOST_DISCONNECT, userId);
      }
      this.#event.emit(lobbyEvent.DISCONNECT, lobby);
      // this.#lobbies.delete(lobbyId);
      delete this.#lobbies[lobbyId];
      return { message: `Lobby with id ${lobbyId} deleted.` };
    } else if (lobby.users[clientId]) {
      delete lobby.users[clientId];
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#emitEventForLobby(lobby, lobbyEvent.USER_DISCONNECT, lobby);
      return lobby;
    } else {
      return { error: disconnectLobbyStatus.USER_NOT_FOUND } as any;
    }
  }

  public startLobby(lobbyId: string, clientId: string): Lobby | any {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id !== clientId) {
      return { error: startLobbyStatus.NOT_HOST } as any;
    }
    if (Object.keys(lobby.users).length < MIN_PLAYER_COUNT) {
      return { error: startLobbyStatus.NOT_ENOUGH_PLAYERS } as any;
    }
    if (!lobby.quiz || !lobby.quizId) {
      return { error: startLobbyStatus.NO_QUIZ_PASSED } as any;
    }
    if (lobby.assignee) lobby.assignee = undefined;
    lobby.state = lobbyStatus.STARTED;
    lobby.currentRound = 1;
    lobby.condition = lobbyCondition.PLAYER_CHOOSES_QUESTION;
    lobby.assignee = LobbyManager.#getNextAssignee(lobby.users, lobby.assignee);
    this.#emitEventForLobby(lobby, lobbyEvent.START, lobby);
  }

  public sendMessageToLobby(body: chatMessageHandlerBody & {clientId: string}): void {
    const lobby = this.#lobbies[body.lobbyId];
    this.#emitEventForLobby(
      <Lobby>lobby,
      lobbyEvent.RECEIVE_MESSAGE,
      body.clientId,
      body.message
    );
  }

  public setQuestion(
    body: questionHandlerBody & { clientId: string }
  ): void | any {
    const lobby = this.#lobbies[body.lobbyId];
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id !== body.clientId) {
      return { error: startLobbyStatus.NOT_HOST } as any;
    }
    if (!lobby.quiz) {
      return { error: startLobbyStatus.NO_QUIZ_PASSED } as any;
    }
    if (lobby.currentQuestion) return { error: gameStatus.QUESTION_ALREADY_TAKEN } as any;
    if (!lobby.currentRound) {
      lobby.currentRound = 1;
    }
    lobby.condition = lobbyCondition.PLAYERS_TAKE_QUESTION;
    const question  = lobby.quiz.rounds[lobby.currentRound].find((qs: any) => qs.id === body.questionId);
    if (!question) {
      return { error: gameStatus.NO_QUESTION_FOUND } as any;
    }
    if (question.questionStatus !== questionStatus.NOT_TAKEN) return { error: gameStatus.QUESTION_ALREADY_TAKEN } as any;
    if (lobby.assignee !== undefined) lobby.assignee = undefined;
    lobby.currentQuestion = question;
    lobby.currentQuestion.questionStatus = questionStatus.ACTIVE;
    lobby.condition = lobbyCondition.PLAYERS_TAKE_QUESTION;
    this.#emitEventForLobby(lobby, lobbyEvent.HOST_SET_QUESTION, lobby);
  }

  public takeQuestion(body: defaultActionHandlerBody & {clientId: string}): void | any {
    const lobby = this.#lobbies[body.lobbyId];
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id === body.clientId) {
      return { error: gameStatus.NO_HOST_QUESTION } as any;
    }
    if (lobby.currentQuestion === undefined) {
      return { error: gameStatus.NO_ACTIVE_QUESTION } as any;
    }
    if (lobby.assignee) {
      return { error: gameStatus.ALREADY_ACTIVE_PLAYER_EXIST } as any;
    }
    lobby.currentQuestion!.questionStatus = questionStatus.ACTIVE;
    lobby.assignee = body.clientId;
    lobby.condition = lobbyCondition.HOST_VALIDATES_ANSWER;
    this.#emitEventForLobby(lobby, lobbyEvent.PLAYER_TAKE_QUESTION, lobby);
  }

  public validateAnswer(body: validateQuestionHandlerBody & { clientId: string }): any {
    const lobby = this.#lobbies[body.lobbyId];
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.assignee === undefined || lobby.currentQuestion === undefined) {
      return { error: gameStatus.NO_ACTIVE_QUESTION } as any;
    }
    const user = lobby.users[lobby.assignee];
    if (body.isRight)
      user!.points += lobby.currentQuestion!.cost;
    else {
      user!.points -= lobby.currentQuestion!.cost;
      lobby.assignee = LobbyManager.#getNextAssignee(lobby.users, lobby.assignee);
    }
    const actionInfo: ActionInfo = {
      playerId: lobby.assignee,
      questionId: lobby.currentQuestion!.id,
      playerScore: lobby.users[<string>lobby.assignee].points,
      isRight: body.isRight,
    };
    lobby.currentQuestion!.questionStatus = questionStatus.TAKEN;
    lobby.condition = lobbyCondition.PLAYER_CHOOSES_QUESTION;
    lobby.currentQuestion = undefined;
    this.#emitEventForLobby(lobby, lobbyEvent.HOST_VALIDATED_ANSWER, {lobby, actionInfo});
    if (lobby.quiz.rounds[lobby.currentRound!].every((q: Question) => q.questionStatus !== questionStatus.NOT_TAKEN)) {
      lobby.currentRound!++;
      this.#emitEventForLobby(lobby, lobbyEvent.SWITCH_ROUND, {lobby: lobby});
    }
    if (lobby.currentRound! > Number(Object.keys(lobby.quiz.rounds)["length"])) {
      this.#emitEventForLobby(lobby, lobbyEvent.END_LOBBY, lobby);
    }
  }

  static #getNextAssignee(users: {[key: string]: ExtendedUserInfo}, current: string | undefined) {
    let counter;
    const ids = Object.keys(users);
    if (current === undefined) return ids[0];
    if (ids.indexOf(current) === ids.length - 1) counter = 0;
    else counter = (ids.indexOf(current)) + 1;
    return ids[counter];
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

  onSetQuestion(handler: (clientId: string, lobby: Lobby) => void):void {
    this.#event.on(lobbyEvent.HOST_SET_QUESTION, handler);
  }

  onTakeQuestion(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.PLAYER_TAKE_QUESTION, handler);
  }

  onValidatedAnswer(handler: (clientId: string, lobby: Lobby, actionInfo: ActionInfo) => void): void {
    this.#event.on(lobbyEvent.HOST_VALIDATED_ANSWER, handler);
  }

  onSwitchRound(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.SWITCH_ROUND, handler);
  }

  onEndLobby(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.END_LOBBY, handler);
  }
}
