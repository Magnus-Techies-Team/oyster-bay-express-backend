import {verify, sign, JwtPayload} from "jsonwebtoken";
import { FastifyRequest, FastifyReply } from "fastify";

export const verifyJWTHook = async (req: FastifyRequest, rep: FastifyReply) => {
  const refresh = req.cookies["ref"];
  const access  = req.headers.authorization?.split(" ")[1];
  if (!access) {
    return rep.status(401).send({ error: `No authorization token passed`});
  }
  verify(refresh, <string>process.env.REFRESH_TOKEN_SECRET, (error, refreshDecoded: any) => {
    if (error) {
      console.log(error);
      return rep.status(401).send({ error: `Token expired` });
    }
    verify(access, <string>process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error || !decoded) {
        const newAccess = sign(refreshDecoded!, <string>process.env.ACCESS_TOKEN_SECRET);
        rep.setCookie("acc", newAccess);
      }
      rep.header("uuid", refreshDecoded.id);
    });
  });
};
