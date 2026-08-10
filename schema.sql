-- =========================================================
-- ZYPHOR'26 — Supabase Database Schema & Storage Setup
-- Copy and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/frhenpsdnfajnphagakk/sql
-- =========================================================

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_name TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    team_leader TEXT NOT NULL,
    num_members INTEGER NOT NULL DEFAULT 1,
    member_names TEXT[] DEFAULT '{}',
    selected_statement TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add column if table already exists
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS selected_statement TEXT DEFAULT NULL;

-- 2. Create Domain Answers Table (Optional/Legacy)
CREATE TABLE IF NOT EXISTS public.domain_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    team_name TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    email TEXT NOT NULL,
    college_name TEXT NOT NULL,
    department TEXT NOT NULL,
    food_pref TEXT NOT NULL,
    veg_count INTEGER DEFAULT 0,
    non_veg_count INTEGER DEFAULT 0,
    total_amount INTEGER DEFAULT 0,
    upi_id TEXT DEFAULT '',
    payment_id TEXT DEFAULT NULL,
    payment_screenshot_url TEXT DEFAULT '',
    payment_status TEXT DEFAULT 'Pending Verification',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    YEar_of_study INTEGER NOT NULL
);

-- Add missing columns if table already exists
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS veg_count INTEGER DEFAULT 0;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS non_veg_count INTEGER DEFAULT 0;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS upi_id TEXT DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS payment_id TEXT DEFAULT NULL;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending Verification';

-- Enable Row Level Security (RLS) & Policies for public access (Anon key)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public insert/update on teams" ON public.teams;
CREATE POLICY "Allow public select on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on domain_answers" ON public.domain_answers;
DROP POLICY IF EXISTS "Allow public insert/update on domain_answers" ON public.domain_answers;
CREATE POLICY "Allow public select on domain_answers" ON public.domain_answers FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on domain_answers" ON public.domain_answers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow public insert/update on registrations" ON public.registrations;
CREATE POLICY "Allow public select on registrations" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);


-- =========================================================
-- 4. Problem Statement Locking
-- One statement_id can belong to only ONE team.
-- This UNIQUE constraint + RPC makes the selection atomic.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.statement_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    statement_id TEXT NOT NULL UNIQUE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    statement_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.statement_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on statement claims" ON public.statement_claims;
CREATE POLICY "Allow public select on statement claims"
ON public.statement_claims FOR SELECT USING (true);

-- Backfill claims for teams that already selected a statement before
-- the one-team-per-statement lock was introduced.
INSERT INTO public.statement_claims (
    statement_id,
    team_id,
    domain,
    statement_data
)
SELECT
    t.selected_statement::jsonb ->> 'id',
    t.id,
    t.domain,
    t.selected_statement::jsonb
FROM public.teams t
WHERE t.selected_statement IS NOT NULL
  AND jsonb_typeof(t.selected_statement::jsonb) = 'object'
  AND t.selected_statement::jsonb ? 'id'
ON CONFLICT (statement_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.claim_problem_statement(
    p_team_id UUID,
    p_statement_id TEXT,
    p_statement JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    team_record public.teams%ROWTYPE;
BEGIN
    SELECT *
    INTO team_record
    FROM public.teams
    WHERE id = p_team_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Team not found.';
    END IF;

    -- If the statement is already claimed, only the owning team may reuse it.
    PERFORM 1
    FROM public.statement_claims
    WHERE statement_id = p_statement_id
      AND team_id = team_record.id;

    IF FOUND THEN
        RETURN p_statement;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.statement_claims
        WHERE statement_id = p_statement_id
    ) THEN
        RAISE EXCEPTION 'This problem statement has already been selected by another team.';
    END IF;

    IF team_record.selected_statement IS NOT NULL THEN
        IF team_record.selected_statement::jsonb ->> 'id' = p_statement_id THEN
            -- Backfill a missing claim for an older team record.
            INSERT INTO public.statement_claims (
                statement_id, team_id, domain, statement_data
            )
            VALUES (
                p_statement_id,
                team_record.id,
                team_record.domain,
                p_statement
            )
            ON CONFLICT (statement_id) DO NOTHING;

            RETURN p_statement::jsonb;
        END IF;

        RAISE EXCEPTION 'This team has already selected a different problem statement.';
    END IF;

    BEGIN
        INSERT INTO public.statement_claims (
            statement_id,
            team_id,
            domain,
            statement_data
        )
        VALUES (
            p_statement_id,
            team_record.id,
            team_record.domain,
            p_statement
        );
    EXCEPTION
        WHEN unique_violation THEN
            RAISE EXCEPTION 'This problem statement has already been selected by another team.';
    END;

    UPDATE public.teams
    SET selected_statement = p_statement::text
    WHERE id = team_record.id;

    RETURN p_statement;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_problem_statement(UUID, TEXT, JSONB)
TO anon, authenticated;


-- =========================================================
-- 5. Payment Screenshot Storage
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public upload payment screenshots" ON storage.objects;
CREATE POLICY "Public upload payment screenshots"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "Public view payment screenshots" ON storage.objects;
CREATE POLICY "Public view payment screenshots"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-screenshots');
