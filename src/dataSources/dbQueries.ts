export const createDatabase = `
  create database ${process.env.DB_NAME};
`;

export const createUsers = `create table if not exists users(
	id uuid primary key,
	login text not null,
	email text not null,
	password text not null
);`

export const createGoogleAuth = `create table if not exists google_auth(
	id uuid primary key ,
	identifier text not null,
	email text not null,
	constraint fk_user foreign key(id) references users(id)
);`

export const createGithubAuth = `create table if not exists github_auth(
	id uuid primary key,
	identifier text not null,
	email text not null,
	constraint fk_user foreign key(id) references users(id)
);`

export const createDiscordAuth = `create table if not exists discord_auth (
	id uuid primary key,
	email text not null,
	identifier text not null,
	constraint fk_user foreign key(id) references users(id)	
);`
export const createQuizz = `create table if not exists quizz (
	id uuid primary key,
	title text not null,
	author uuid not null,
	private boolean default false,
	tags text[],
	constraint fk_author foreign key(author) references users(id)
);`

export const createRound = `create table if not exists round (
	id serial primary key,
	quizz te not null,
	round_number integer not null check (round_number > 0),
	constraint fk_quiz foreign key(quizz) references quizz(id)
);`

export const createQuestionType = `create type if not exists question_type as enum ('text', 'image', 'sound');`

export const createQuestions = `create table if not exists questions (
	id serial primary key,
	question text not null,
	answer text not null
	round integer,
	cost integer not null check (cost > 0),
	topic text not null,
	type question_type not null,
	file_path text,
	constraint fk_round foreign key(round) references round(id)
);`