create table public.boards (
  id text primary key,
  clusters jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

create table public.comments (
  id uuid default gen_random_uuid() primary key,
  project_id text not null,
  cluster_id text,
  author text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable Realtime for both tables
-- We check if they are already in publication to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'boards'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE boards;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'comments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE comments;
    END IF;
END $$;
