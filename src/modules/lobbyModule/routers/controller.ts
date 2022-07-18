import { FastifyReply, FastifyRequest } from "fastify";
import { lobbyManager } from "~/projectDependencies";
import { RouteGenericInterfaceDisconnectLobby } from "~/modules/lobbyModule/types/reqInterface";

export const createLobby = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const body: any = req.body;
  const lobby = lobbyManager.createLobby(body.quizId, body.hostId);
  return rep.status(200).send(lobby);
};

export const joinLobby = async (
  req: FastifyRequest,
  rep: FastifyReply
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

export const startLobby = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const clientId = "req.query.clientId";
  const lobbyId = "req.query.lobbyId";
  const lobby = lobbyManager.startLobby(lobbyId, clientId);
  if (lobby.error) return rep.status(400).send(lobby.error);
  else return rep.status(200).send(lobby);
};
