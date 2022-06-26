import ServiceClass from "../../../utils/serviceClass";

class UserManager {
  public async createUser(userData: {
    login: string;
    password: string;
    email: string;
  }) {
    const emailMatcher =
      /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if (emailMatcher.exec(userData.email)) {
      const userCreated = await ServiceClass.createRecord({
        tableName: "users",
        columnObject: userData,
      });
      if (userCreated.error) {
        return {error: userCreated.error};
      }
      delete userCreated.rows[0].password;
      return userCreated.rows[0];
    }
    return { error: `Invalid email pattern` };
  }

  public async login(userData: { login: string; password: string }) {
    const user = await ServiceClass.getRecord({
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

export default new UserManager();
