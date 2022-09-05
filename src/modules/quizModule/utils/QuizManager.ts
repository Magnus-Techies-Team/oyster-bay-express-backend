import { dbHelper } from "~/projectDependencies";
import { Quiz } from "~/modules/quizModule/types/Quiz";
import {
  getAvailableQuizes,
  getQuizQuestions,
  insertQuizQuestions,
} from "~/dataSources/dbQueries";
import { ErrorConstraints } from "~/constraints/errorConstraints";
import { questionStatus } from "~/modules/lobbyModule/types/lobbyConstants";

export default class QuizManager {
  public async recordQuiz(quiz: Quiz, author: string): Promise<any> {
    const query = this.generateQuizQueries(quiz, author);
    const result = await dbHelper.executePgQuery({
      query: query,
      values: [],
    });
    if (result.error) {
      return { error: result.error };
    }
    return result[1].rows;
  }

  public async getQuizQuestions(user: string, id: string): Promise<any> {
    const query = getQuizQuestions(user, id);
    const result = await dbHelper.executePgQuery({ query: query, values: [] });
    if (result.error) {
      return { error: result.error };
    }
    if (!result.rows.length) {
      return { error: ErrorConstraints.INVALID_QUIZ };
    }
    const quizQuestions = this.convertQuizToQuestions(result.rows);
    quizQuestions.totalRounds = Object.keys(quizQuestions.rounds).length;
    quizQuestions.topicQuestions = this.getQuizTopicQuestionsCount(
      Object.values(quizQuestions.rounds)[0]
    );
    quizQuestions.roundTopics = this.getQuizRoundTopicsCount(
      Object.values(quizQuestions.rounds)[0]
    );
    return quizQuestions;
  }

  public async getAllAvailableQuizes(user: string): Promise<any> {
    const query = getAvailableQuizes(user);
    const result = await dbHelper.executePgQuery({ query: query, values: [] });
    if (result.error) {
      return { error: result.error };
    }
    return result.rows;
  }

  public generateQuizQueries(quiz: Quiz, author: string | null): string {
    const questionValues = new Array<string>();
    const tags = quiz.tags.map((tag) => `'${tag}'`).join(",");
    let query = insertQuizQuestions(quiz, author, tags);
    quiz.questions.forEach((question) => {
      questionValues.push(`('${question.question.replace(
        /'/gm,
        "''"
      )}', quizId, ${question.round},
       '${question.answer.replace(/'/gm, "''")}', ${
  question.cost
}, '${question.topic.replace(/'/gm, "''")}', '${question.type}')`);
    });
    query = query.replace("REPLACEMENT", questionValues.join(","));
    return query;
  }

  private convertQuizToQuestions(questions: { [key: string]: any }[]): {
    [key: string]: any;
  } {
    const resultObj: { [key: string]: any } = {
      author_username: questions[0].author_username,
      author: questions[0].author,
      title: questions[0].quiz_title,
      private: questions[0].private,
      tags: questions[0].tags,
      rounds: {},
    };
    questions.forEach((qs) => {
      if (!resultObj.rounds[qs.round]) {
        resultObj.rounds[qs.round] = [
          {
            id: qs.id,
            question: qs.question,
            answer: qs.answer,
            cost: qs.cost,
            topic: qs.topic,
            type: qs.type,
            questionStatus: questionStatus.NOT_TAKEN
          },
        ];
      } else {
        resultObj.rounds[qs.round].push({
          id: qs.id,
          question: qs.question,
          answer: qs.answer,
          cost: qs.cost,
          topic: qs.topic,
          type: qs.type,
          questionStatus: questionStatus.NOT_TAKEN
        });
      }
    });
    return resultObj;
  }

  private getQuizRoundTopicsCount(roundQuestions: any): number {
    return new Set(roundQuestions.map((el: any) => el.topic)).size;
  }

  private getQuizTopicQuestionsCount(roundQuestions: any): number {
    return roundQuestions.filter(
      (e: any) => e.topic === roundQuestions[0].topic
    ).length;
  }
}
