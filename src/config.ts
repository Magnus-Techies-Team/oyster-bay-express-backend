export const SERVER_SETTINGS = {
  logger: true,
  exposeHeadRoutes: false,
};
export const COOKIE_SETTINGS = { secret: <string>process.env.COOKIE_SECRET };
export const CORS_SETTINGS = {
  origin: ["http://localhost:4200"],
  optionsSuccessStatus: 200,
  credentials: true,
};
export const WEBSOCKET_SETTINGS = {};
