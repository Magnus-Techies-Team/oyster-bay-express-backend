import { FastifyReply, FastifyRequest } from "fastify";
import lobbyManager from "../../lobbyModule/utils/lobbyManager";
import { RouteGenericInterfaceDisconnectLobby } from "../types/reqInterface";

export const createLobby = async (
  req: FastifyRequest,
  rep: FastifyReply,
): Promise<FastifyReply> => {
  const body: any = req.body;
  const lobby = lobbyManager.createLobby(body.quizId, body.hostId);
  return rep.status(200).send(lobby);
};

export const joinLobby = async (
  req: FastifyRequest,
  rep: FastifyReply,
): Promise<FastifyReply> => {
  const body: any = req.body;
  const lobby = lobbyManager.joinLobby(body.clientId, body.lobbyId);
  return rep.status(200).send(lobby);
};

export const disconnectLobby = async (
  req: FastifyRequest<RouteGenericInterfaceDisconnectLobby>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const clientId = req.query.clientId;
  const lobbyId = req.query.lobbyId;
  const lobby = lobbyManager.disconnectLobby(lobbyId, clientId);
  return rep.status(200).send(lobby);
};
