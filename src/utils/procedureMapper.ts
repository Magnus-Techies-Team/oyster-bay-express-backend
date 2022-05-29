import procedures from "../procedures";
import { ProcedureType } from "./procedure.type";

class ProcedureMapper {

  private procedures: {[key: string]: Function};
  constructor() {
    this.procedures = procedures
  }

  public getProcedure(options: ProcedureType) {
    return this.procedures[options.method] ?? function(args: any[]) {/** */};
  }
}

export default new ProcedureMapper();