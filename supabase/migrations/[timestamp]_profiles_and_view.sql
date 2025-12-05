-- ============================================
-- Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow authenticated users to view all profiles (for feed display)
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- Ensure scans table has user_id column
-- ============================================
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- ============================================
-- Create view to join scans with profiles
-- ============================================
CREATE OR REPLACE VIEW public.scan_with_profile AS
SELECT
  s.id,
  s.code,
  s.user_id,
  p.username,
  s.created_at
FROM public.scans s
LEFT JOIN public.profiles p ON p.id = s.user_id
ORDER BY s.created_at DESC;

-- Grant access to authenticated users
GRANT SELECT ON public.scan_with_profile TO authenticated;