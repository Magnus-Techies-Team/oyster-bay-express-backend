export const ErrorConstraints = {
  INVALID_PASSWORD: {
    type: "invalidPassword",
    message: "The password is incorrect",
  },
  EMAIL_OR_USERNAME_ALREADY_EXIST: {
    type: "emailOrUsernameAlreadyExists",
    message: "Email or username already exists",
  },
  CREATING_USER_ERROR: {
    type: "creatingUserError",
    message: "Error occurred while creating user",
  },
  UNAUTHORIZED_ERROR: {
    type: "unauthorizedError",
    message: "User is not authorized",
  },
  INVALID_USER_ID: {
    type: "invalidUserID",
    message: "Invalid user ID",
  },
  INVALID_EMAIL: {
    type: "invalidEmail",
    message: "Invalid email was provided",
  },
  NO_AUTH_TOKEN: {
    type: "noAuthToken",
    message: "No authorization token passed",
  },
  TOKEN_EXPIRED: {
    type: "tokenExpired",
    message: "Token has expired",
  },
};
