import { Quiz } from "~/modules/quizModule/types/Quiz";

export const checkIfQuizesExist = `
  select count(*) from quiz;
`;

export const installExtension = `
  create extension if not exists "uuid-ossp";
`;

export const createUsersTable = `create table if not exists users(
  id uuid primary key default uuid_generate_v4(),
  login text not null unique,
  email text not null unique,
  password text not null
);`;

export const createQuizTable = `create table if not exists quiz (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author uuid references users,
  private boolean default false,
  tags text[]
);`;

export const createQuestionType = `
do $$ begin
  create type question_type as enum ('text', 'image', 'audio');
exception
  when duplicate_object then null;
end $$;`;

export const createQuestionsTable = `create table if not exists questions (
  id serial primary key,
  question text not null,
  quiz uuid not null,
  round integer check(round > 0),
  answer text not null,
  cost integer not null check (cost > 0),
  topic text not null,
  type question_type,
  file_path text,
  constraint fk_quiz foreign key(quiz) references quiz(id)
);`;

export const getAvailableQuizes = (user: string): string => `
  with q as (select * from quiz where (not private or author='${user}')) 
  select q.id, q.title, q.author, q.private, q.tags, users.login as author_username 
  from q left join users on (q.author=users.id)`;

export const insertQuizQuestions = (
  quiz: Quiz,
  author: string | null,
  tags: string
): string => {
  const authorId = author ? `'${author}'` : null;
  return `
    create or replace function createQuiz() returns setof questions language plpgsql as
    $$
    declare quizId uuid;
    begin
    insert into quiz(title, author, private, tags) 
    values('${quiz.title}', ${authorId}, ${quiz.private}, array[${tags}]) returning id into quizId;
    insert into questions(question, quiz, round, answer, cost, topic, type) 
    values REPLACEMENT;
    return query select * from questions where quiz = quizId;
    end $$;
    select * from createQuiz();
  `;
};

export const getQuizQuestions = (user: string, id: string): string => `
  select qs.question, qs.answer, qs.cost, qs.round, qs.topic, 
  qs.type, q.title as quiz_title, q.tags, q.private, q.author, u.login as author_username 
  from Questions qs join Quiz q on qs.quiz=q.id join Users u 
  on q.author = u.id where q.id='${id}' and not private or q.author='${user}'
`;
