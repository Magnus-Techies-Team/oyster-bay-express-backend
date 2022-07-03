import { RouteOptions } from "fastify";
import { hookHandler, hookHandlerAsync } from "./hookTypes";

class GeneralHook {
  private applyHook(
    routes: RouteOptions[],
    hookMethodObj: { [key: string]: hookHandler | hookHandlerAsync }
  ) {
    routes = routes.map((route: RouteOptions) => {
      return {
        ...route,
        ...hookMethodObj,
      };
    });
    return routes;
  }

  public applyGeneralHook(routes: RouteOptions[]) { // use in future to validate auth
    return this.applyHook(routes, {
      // preValidation: function (
      //   req: FastifyRequest,
      //   rep: FastifyReply,
      //   done: any
      // ) {
      //   done();
      // },
    });
  }
}

export default new GeneralHook();