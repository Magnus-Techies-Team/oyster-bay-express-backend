import * as fs from "fs";
import CsvAsync from "async-csv";
import { resolve } from "path";
import { dbHelper, quizManager } from "~/projectDependencies";
import { Question } from "~/modules/quizModule/types/Quiz";
import { initLocalDatabasesIfNotExists } from "~/dataSources/initLocalDatabases";
import { checkIfQuizesExist } from "./dataSources/dbQueries";

export const seedDB = async (): Promise<void> => {
  await initLocalDatabasesIfNotExists();
  const empty = await dbHelper.executePgQuery({
    query: checkIfQuizesExist,
    values: [],
  });
  if (empty.rows[0].count > 0) return;
  const path = resolve(process.cwd(), "seeds");
  const seeds = fs.readdirSync(path);
  for (const seed of seeds) {
    const seedPath = resolve(path, seed);
    const [title, tagsString] = seed.split(".csv")[0].split("_");
    const csvText = fs.readFileSync(seedPath);
    const csvObj = await CsvAsync.parse(csvText.toString("utf-8"), {
      columns: true,
    });
    const quiz = {
      title: title,
      tags: tagsString.split("^"),
      private: false,
      questions: csvObj as Question[],
    };
    const query = quizManager.generateQuizQueries(quiz, null);
    await dbHelper.executePgQuery({ query: query, values: [] });
  }
};
