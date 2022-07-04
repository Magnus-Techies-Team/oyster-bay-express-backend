import { serviceClass } from "../../../projectDependencies";

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
        return { error: userCreated.error } as any;
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
}
