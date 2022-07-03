export const SERVER_OPTIONS = {
  logger: true,
  exposeHeadRoutes: false,
};
export const COOKIE_SETTINGS = { secret: <string>process.env.COOKIE_SECRET };
export const CORS_SETTINGS = { "allow-origin": "*" };
export const WEBSOCKET_SETTINGS = {};
