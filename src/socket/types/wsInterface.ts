import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {BasicUserInfo} from "~/modules/lobbyModule/types/User";

export type createLobbyHandlerBody = {quizId: string};

export type defaultActionHandlerBody = {lobbyId: string}

export type chatMessageHandlerBody = defaultActionHandlerBody & {message: string};

export type questionHandlerBody = defaultActionHandlerBody & { questionId: string };

export type validateQuestionHandlerBody = defaultActionHandlerBody & { isRight: boolean };

export type defaultHandlerResponse = {lobby: Lobby, currentUser: BasicUserInfo};