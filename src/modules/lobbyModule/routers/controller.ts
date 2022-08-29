import {FastifyReply, FastifyRequest} from "fastify";
import {lobbyManager} from "~/projectDependencies";
import {
  RouteGenericInterfaceGetAllLobbies,
  RouteGenericInterfaceGetCurrentLobby
} from "~/modules/lobbyModule/types/reqInterface";
import {RestError} from "~/utils/restError";
import {ErrorsTypes} from "~/types/restErrorTypes";
import {userStatus} from "~/modules/lobbyModule/types/LobbyConstants";

export const getAllAvailableLobbies = async (
  req: FastifyRequest<RouteGenericInterfaceGetAllLobbies>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const lobbies = lobbyManager.getLobby();
  return rep.status(200).send(Object.values(lobbies)
    .map((lobby: any) => {return {id: lobby.id, host: {user_id: lobby.host.user_id,user_name: lobby.host.user_name,}, users: Object.values(lobby.users)
      .map((user: any) => {return {user_id: user.user_id, user_name: user.user_name};})};}));
};

export const getCurrentLobbyStatus = async (
  req: FastifyRequest<RouteGenericInterfaceGetCurrentLobby>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const lobby = lobbyManager.getLobby(req.params.lobbyId);
  if (lobby.error) return rep.status(400).send(new RestError(ErrorsTypes.BadRequest, lobby.error));
  let clientStatus;
  if (lobby.hostId === req.cookies.uuid) clientStatus = userStatus.HOST;
  else if (lobby.users[req.cookies.uuid]) clientStatus = userStatus.PLAYER;
  else clientStatus = userStatus.SPECTATOR;
  return rep.status(200).send({lobbyStatus: lobby.state, userStatus: clientStatus});
};

export const getUserActiveLobby = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const lobbies = lobbyManager.getLobby();
  for (const lobbyId in lobbies)
    if (lobbies[lobbyId].users[req.cookies.uuid]) return rep.status(200).send({activeLobbyId: lobbyId});
  return rep.status(200).send({activeLobbyId: null});
};

export const getLobby = async (
  req: FastifyRequest<RouteGenericInterfaceGetCurrentLobby>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const lobby = lobbyManager.getLobby(<string>req.params.lobbyId);
  return rep.status(200).send({lobby: lobby});
};

