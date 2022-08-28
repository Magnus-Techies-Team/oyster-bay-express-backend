import { verify, sign } from "jsonwebtoken";
import { FastifyRequest, FastifyReply } from "fastify";
import { ErrorConstraints } from "~/constraints/errorConstraints";

export const verifyJWTHook = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<any> => {
  const refresh = req.cookies["ref"];
  const access = req.cookies["acc"];
  if (!refresh) {
    return rep.status(401).send(ErrorConstraints.NO_AUTH_TOKEN);
  }
  verify(
    refresh,
    <string>process.env.REFRESH_TOKEN_SECRET,
    (error, refreshDecoded: any) => {
      if (error) {
        console.log(error);
        return rep.status(401).send(ErrorConstraints.TOKEN_EXPIRED);
      }
      verify(
        access,
        <string>process.env.ACCESS_TOKEN_SECRET,
        (error, decoded) => {
          if (error || !decoded) {
            const newAccess = sign(
              refreshDecoded,
              <string>process.env.ACCESS_TOKEN_SECRET
            );
            rep.setCookie("acc", newAccess);
          }
          rep.setCookie("uuid", refreshDecoded.id);
        }
      );
    }
  );
};
