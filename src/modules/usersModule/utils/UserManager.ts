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
          return { error: `User with such email or username already exists` };
        }
        return { error: `Error occurred while creating user` };
      }
      delete userCreated.rows[0].password;
      return userCreated.rows[0];
    }
    return { error: `Invalid email pattern` };
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
      return { error: `Invalid password` };
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
