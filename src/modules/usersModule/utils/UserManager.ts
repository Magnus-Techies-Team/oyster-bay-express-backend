import { ErrorConstraints } from "~/constraints/errorConstraints";
import { dbHelper, serviceClass } from "~/projectDependencies";

export default class UserManager {
  public async createUser(userData: {
    login: string;
    password: string;
    email: string;
  }): Promise<any> {
    const emailMatcher =
      /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if (emailMatcher.exec(userData.email)) {
      const userCreated = await serviceClass.createRecord({
        tableName: "users",
        columnObject: userData,
      });
      if (userCreated.error) {
        if (userCreated.error.code === "23505") {
          return { error: ErrorConstraints.EMAIL_OR_USERNAME_ALREADY_EXIST };
        }
        return { error: ErrorConstraints.CREATING_USER_ERROR };
      }
      delete userCreated.rows[0].password;
      return userCreated.rows[0];
    }
    return { error: ErrorConstraints.INVALID_EMAIL };
  }

  public async login(userData: {
    login: string;
    password: string;
  }): Promise<any> {
    const user = await serviceClass.getRecord({
      tableName: "users",
      searchBy: "login",
      value: userData.login,
    });
    if (user.error) {
      return { error: user.error };
    } else if (userData.password !== user.rows[0].password) {
      return { error: ErrorConstraints.INVALID_PASSWORD };
    } else {
      const data = { ...user.rows[0] };
      delete data.password;
      return data;
    }
  }

  public async getUser(id: string): Promise<any> {
    const query = `select login, email from Users where id='${id}'`;
    const result = await dbHelper.executePgQuery({ query: query, values: [] });
    if (result.error) {
      return { error: result.error };
    }
    return result.rows[0];
  }
}
