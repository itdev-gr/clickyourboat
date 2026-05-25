-- Tighten search_admin_conversations() to explicitly gate by admin role.
--
-- Background: the prior version relied on RLS on conversations/messages to
-- gate access. But the existing participant-only RLS policy on conversations
-- meant a non-admin caller would still get their own conversations back from
-- this RPC (with flag columns null). The RPC is intended to be admin-only.
-- This migration adds an explicit admin check inside the function body so
-- the RPC returns zero rows for any non-admin caller regardless of which
-- RLS policies the caller satisfies on the underlying tables.
--
-- Purely additive: replaces the function via CREATE OR REPLACE. No data
-- modified, no tables/columns altered, no policies dropped.

CREATE OR REPLACE FUNCTION public.search_admin_conversations(
  p_flag_state text DEFAULT NULL,
  p_participant_query text DEFAULT NULL,
  p_content_query text DEFAULT NULL,
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
      (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
      AND (p_flag_state IS NULL OR COALESCE(f.state, 'open') = p_flag_state)
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
