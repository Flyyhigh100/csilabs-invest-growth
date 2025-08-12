-- Add ityrelldabney@gmail.com as an admin
-- Use existing auth.users id if available; otherwise generate a UUID
WITH candidate AS (
  SELECT id FROM auth.users WHERE email = 'ityrelldabney@gmail.com' LIMIT 1
),
prepared AS (
  SELECT COALESCE((SELECT id FROM candidate), gen_random_uuid()) AS id,
         'ityrelldabney@gmail.com'::text AS email,
         'admin'::text AS role
)
INSERT INTO public.admins (id, email, role)
SELECT id, email, role
FROM prepared
WHERE NOT EXISTS (
  SELECT 1 FROM public.admins WHERE email = 'ityrelldabney@gmail.com'
);

-- Verify insertion (returns 1 row if present)
SELECT id, email, role, created_at
FROM public.admins
WHERE email = 'ityrelldabney@gmail.com';