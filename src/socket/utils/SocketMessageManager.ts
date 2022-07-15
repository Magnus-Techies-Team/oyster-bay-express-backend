export default class SocketMessageManager {
  generateString(data: { [key: string]: any }): string {
    return JSON.stringify(this.generateJson(data));
  }
  generateJson(data: { [key: string]: any }): { [key: string]: any } {
    return { response: data };
  }
}
