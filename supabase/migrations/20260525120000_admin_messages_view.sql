-- Admin Conversations View — additive migration.
-- Adds: conversation_admin_flags table, admin RLS policies on conversations/messages,
-- FTS GIN index on messages.text, and search_admin_conversations() RPC.
--
-- HARD CONSTRAINT: This migration is purely additive. NO DROP, NO DELETE,
-- NO destructive UPDATE. No DELETE policies are added.

-- 1. Flag table (admin annotations) ------------------------------------------

CREATE TABLE IF NOT EXISTS public.conversation_admin_flags (
  conversation_id uuid PRIMARY KEY REFERENCES public.conversations(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'open' CHECK (state IN ('open','flagged','reviewed')),
  note text,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_admin_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read flags" ON public.conversation_admin_flags
  FOR SELECT USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admins write flags" ON public.conversation_admin_flags
  FOR ALL USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  ) WITH CHECK (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 2. Admin SELECT policies on existing tables (additive — existing
--    participant-only policies remain in force for non-admin users). --------

CREATE POLICY "admins read all conversations" ON public.conversations
  FOR SELECT USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admins read all messages" ON public.messages
  FOR SELECT USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. FTS index on messages.text. 'simple' config (no stemming) chosen
--    because conversations mix English and Greek. ---------------------------

CREATE INDEX IF NOT EXISTS messages_text_fts_idx
  ON public.messages USING gin (to_tsvector('simple', text));

-- 4. RPC function: one-call admin search with filters + pagination ----------

CREATE OR REPLACE FUNCTION public.search_admin_conversations(
  p_flag_state text DEFAULT NULL,         -- 'open' | 'flagged' | 'reviewed' | NULL
  p_participant_query text DEFAULT NULL,  -- matches profiles.email OR display_name (ILIKE)
  p_content_query text DEFAULT NULL,      -- FTS on messages.text
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  id uuid,
  participants text[],
  participant_details jsonb,
  boat_id uuid,
  boat_title text,
  last_message jsonb,
  updated_at timestamptz,
  flag_state text,
  flag_note text,
  flag_updated_at timestamptz,
  total_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH filtered AS (
    SELECT
      c.id,
      c.participants,
      c.participant_details,
      c.boat_id,
      c.boat_title,
      c.last_message,
      c.updated_at,
      COALESCE(f.state, 'open') AS flag_state,
      f.note AS flag_note,
      f.updated_at AS flag_updated_at
    FROM public.conversations c
    LEFT JOIN public.conversation_admin_flags f ON f.conversation_id = c.id
    WHERE
      (p_flag_state IS NULL OR COALESCE(f.state, 'open') = p_flag_state)
      AND (
        p_participant_query IS NULL
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = ANY(c.participants)
            AND (p.email ILIKE '%' || p_participant_query || '%'
                 OR p.display_name ILIKE '%' || p_participant_query || '%')
        )
      )
      AND (
        p_content_query IS NULL
        OR EXISTS (
          SELECT 1 FROM public.messages m
          WHERE m.conversation_id = c.id
            AND to_tsvector('simple', m.text) @@ plainto_tsquery('simple', p_content_query)
        )
      )
  )
  SELECT
    fi.id, fi.participants, fi.participant_details,
    fi.boat_id, fi.boat_title, fi.last_message, fi.updated_at,
    fi.flag_state, fi.flag_note, fi.flag_updated_at,
    COUNT(*) OVER () AS total_count
  FROM filtered fi
  ORDER BY fi.updated_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
$$;

REVOKE EXECUTE ON FUNCTION public.search_admin_conversations(text, text, text, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.search_admin_conversations(text, text, text, int, int) TO authenticated;
