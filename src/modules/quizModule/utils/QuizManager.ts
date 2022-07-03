import { dbHelper } from "../../../projectDependencies";
import { Quiz } from "../types/Quiz";

export default class QuizManager {
  public async recordQuiz(quiz: Quiz, author: string) {
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

  public async getAllAvailableQuizes(user: string) {
    const query = `with q as (select * from quiz where private=false or author='${user}') 
      select q.id, q.title, q.author, users.login as author_username, q.private, q.tags 
      from users full join q on q.author=users.id` ;
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
}
