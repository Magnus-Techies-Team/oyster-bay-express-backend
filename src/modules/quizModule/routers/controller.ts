import { FastifyReply, FastifyRequest } from "fastify";
import { RouteGenericInterfaceCreateQuiz } from "../types/reqInterface";
import QuizManager from "../utils/QuizManager";
import { verify } from "jsonwebtoken";
import server from "../../../server";
import { EventEmitter } from "events";
import { lobbyEvent } from "../../../socket/types/lobbyEvent";
import lobbyManager from "../../lobbyModule/utils/lobbyManager";
import socketRegistry from "../../../socket/socketRegistry";

export const createQuiz = async (
  req: FastifyRequest<RouteGenericInterfaceCreateQuiz>,
  rep: FastifyReply
) => {
  const userId = rep.getHeader("uuid");
  const quiz = {...req.body, author: userId};
  const result = await QuizManager.recordQuiz(quiz, userId!);
  return rep.status(200).send(result);
};

export const createLobby = async (req: FastifyRequest, rep: FastifyReply) => {
  const body: any = req.body;
  const lobby = lobbyManager.createLobby(body.quizId, body.hostId);
  rep.status(200).send(lobby);
};

export const joinLobby = async (req: FastifyRequest, rep: FastifyReply) => {
  const body: any = req.body;
  const lobby = lobbyManager.joinLobby(body.clientId, body.lobbyId);
  rep.status(200).send(lobby);
};

export const disconnectLobby = async (
  req: FastifyRequest,
  rep: FastifyReply
) => {
  const body: any = req.body;
  const lobby = lobbyManager.disconnectLobby(body.lobbyId, body.clientId);
  rep.status(200).send(lobby);
};
