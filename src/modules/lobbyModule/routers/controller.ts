import {FastifyReply, FastifyRequest} from "fastify";
import {lobbyManager} from "~/projectDependencies";
import {
  RouteGenericInterfaceGetAllLobbies,
  RouteGenericInterfaceGetCurrentLobby
} from "~/modules/lobbyModule/types/reqInterface";
import {RestError} from "~/utils/restError";
import {ErrorsTypes} from "~/types/restErrorTypes";
import {userStatus} from "~/modules/lobbyModule/types/lobbyConstants";

export const getAllAvailableLobbies = async (
  req: FastifyRequest<RouteGenericInterfaceGetAllLobbies>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const lobbies = lobbyManager.getLobby();
  console.log(lobbies);
  return rep.status(200).send(lobbies);
};

export const getCurrentLobbyStatus = async (
  req: FastifyRequest<RouteGenericInterfaceGetCurrentLobby>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const lobby = lobbyManager.getLobby(req.query.lobbyId);
  if (lobby.error) return rep.status(400).send(new RestError(ErrorsTypes.BadRequest, lobby.error));
  let clientStatus;
  if (lobby.hostId === req.cookies.uuid) clientStatus = userStatus.HOST;
  else if (lobby.users.has(req.cookies.uuid)) clientStatus = userStatus.PLAYER;
  else clientStatus = userStatus.SPECTATOR;
  return rep.status(200).send({lobbyStatus: lobby.state, userStatus: clientStatus});
};

export const getUserActiveLobby = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const lobbies = lobbyManager.getLobby();
  for (const lobby of lobbies)
    if (lobby.users[req.cookies.uuid]) return rep.status(200).send({activeLobbyId: lobby.id});
  return rep.status(200).send({activeLobbyId: null});
};

