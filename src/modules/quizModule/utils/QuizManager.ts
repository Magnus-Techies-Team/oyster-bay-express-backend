import { dbHelper } from "~/projectDependencies";
import { Quiz } from "~/modules/quizModule/types/Quiz";

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
    const query = `select qs.question, qs.answer, qs.cost, qs.round, qs.topic, 
      qs.type, q.title as quiz_title, q.tags, u.login as author_username 
      from Questions qs join Quiz q on qs.quiz=q.id join Users u 
      on q.author = u.id where q.id='${id}' and not private or q.author='${user}'`;
    const result = await dbHelper.executePgQuery({ query: query, values: [] });
    if (result.error) {
      return { error: result.error };
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
    const query = `with q as (select * from quiz where private=false or author='${user}') 
      select q.id, q.title, q.author, users.login as author_username, q.private, q.tags 
      from users join q on q.author=users.id`;
    const result = await dbHelper.executePgQuery({ query: query, values: [] });
    if (result.error) {
      return { error: result.error };
    }
    return result.rows;
  }

  private generateQuizQueries(quiz: Quiz, author: string) {
    const questionValues = new Array<string>();
    const tags = `${quiz.tags.map((tag) => `'${tag}'`)}`;
    let query = `
    create or replace function createQuiz() returns setof questions language plpgsql as
     $$
    declare quizId uuid;
    begin
    insert into quiz(title, author, private, tags) 
    values('${quiz.title}', '${author}', ${quiz.private}, array[${tags}]) returning id into quizId;
    insert into questions(question, quiz, round, answer, cost, topic, type) 
    values REPLACEMENT;
    return query select * from questions where quiz = quizId;
    end $$;
    select * from createQuiz();
    `;
    quiz.questions.forEach((question) => {
      questionValues.push(`('${question.question}', quizId, ${question.round},
       '${question.answer}', ${question.cost}, '${question.topic}', '${question.type}')`);
    });
    query = query.replace("REPLACEMENT", questionValues.join(","));
    return query;
  }

  private convertQuizToQuestions(questions: { [key: string]: any }[]): {
    [key: string]: any;
  } {
    const resultObj: { [key: string]: any } = {
      author: questions[0].author_username,
      title: questions[0].quiz_title,
      tags: questions[0].tags,
      rounds: {},
    };
    questions.forEach((qs) => {
      if (!resultObj.rounds[qs.round]) {
        resultObj.rounds[qs.round] = [
          {
            question: qs.question,
            answer: qs.answer,
            cost: qs.cost,
            topic: qs.topic,
            type: qs.type,
          },
        ];
      } else {
        resultObj.rounds[qs.round].push({
          question: qs.question,
          answer: qs.answer,
          cost: qs.cost,
          topic: qs.topic,
          type: qs.type,
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
