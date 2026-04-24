-- Drop existing tables to start fresh
drop table if exists public.comments cascade;
drop table if exists public.confirmed_cards cascade;
drop table if exists public.extracted_cards cascade;
drop table if exists public.transcripts cascade;
drop table if exists public.boards cascade;
drop table if exists public.sessions cascade;

-- 1. Sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  stakeholder_name text not null,
  stakeholder_role text,
  interview_date timestamptz,
  interview_method text,
  sector text not null,
  stage text not null,
  round_number integer,
  research_question text not null,
  sorting_mode text,
  guided_mode boolean default false,
  consent_timestamp timestamptz,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Boards table
create table public.boards (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  clusters jsonb not null default '[]'::jsonb,
  last_edited_at timestamptz default now(),
  version integer default 1,
  unique(session_id)
);

-- 3. Transcripts table
create table public.transcripts (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  transcript_text text not null,
  source text not null,
  language text,
  processing_engine text,
  audio_url text,
  created_at timestamptz default now()
);

-- 4. Extracted Cards table
create table public.extracted_cards (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  card_id text not null,
  insight text not null,
  quote text not null,
  speaker text,
  timestamp text,
  sentiment text not null,
  confidence text not null,
  assertive boolean default false,
  theme text,
  created_at timestamptz default now()
);

-- 5. Confirmed Cards table
create table public.confirmed_cards (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  card_id text not null,
  insight text not null,
  quote text not null,
  speaker text,
  timestamp text,
  sentiment text not null,
  confidence text not null,
  assertive boolean default false,
  theme text,
  freq integer default 1,
  reviewed boolean default false,
  split_from uuid,
  created_at timestamptz default now()
);

-- 6. Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  target_type text not null, -- 'card' or 'cluster'
  target_id text not null,
  author_name text not null,
  author_role text,
  comment_text text not null,
  created_at timestamptz default now()
);

-- Enable Realtime
alter publication supabase_realtime add table public.boards;
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.confirmed_cards;

-- Basic RLS (Disable for initial development/setup if needed, but good to have)
alter table public.sessions enable row level security;
alter table public.boards enable row level security;
alter table public.transcripts enable row level security;
alter table public.extracted_cards enable row level security;
alter table public.confirmed_cards enable row level security;
alter table public.comments enable row level security;

-- Simple "allow all" policies for development
create policy "Allow all for sessions" on public.sessions for all using (true);
create policy "Allow all for boards" on public.boards for all using (true);
create policy "Allow all for transcripts" on public.transcripts for all using (true);
create policy "Allow all for extracted_cards" on public.extracted_cards for all using (true);
create policy "Allow all for confirmed_cards" on public.confirmed_cards for all using (true);
create policy "Allow all for comments" on public.comments for all using (true);
