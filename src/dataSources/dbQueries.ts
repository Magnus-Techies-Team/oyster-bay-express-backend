export const installExtension = `
	create extension if not exists "uuid-ossp";
`;

export const createUsers = `create table if not exists users(
	id uuid primary key default uuid_generate_v4(),
	login text not null unique,
	email text not null unique,
	password text not null
);`;

export const createGoogleAuth = `create table if not exists google_auth(
	id uuid primary key default uuid_generate_v4(),
	identifier text not null unique,
	email text not null unique,
	constraint fk_user foreign key(id) references users(id)
);`;

export const createGithubAuth = `create table if not exists github_auth(
	id uuid primary key default uuid_generate_v4(),
	identifier text not null unique,
	email text not null unique,
	constraint fk_user foreign key(id) references users(id)
);`;

export const createDiscordAuth = `create table if not exists discord_auth (
	id uuid primary key default uuid_generate_v4(),
	email text not null unique,
	identifier text not null,
	constraint fk_user foreign key(id) references users(id)	
);`;
export const createQuiz = `create table if not exists quiz (
	id uuid default uuid_generate_v4() primary key,
	title text not null,
	author uuid not null,
	private boolean default false,
	tags text[],
	constraint fk_author foreign key(author) references users(id)
);`;

export const createQuestionType = `
do $$ begin
	create type question_type as enum ('text', 'image', 'audio');
exception
	when duplicate_object then null;
end $$;`;

export const createQuestions = `create table if not exists questions (
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
