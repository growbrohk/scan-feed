-- Add user_id column to scans table
ALTER TABLE public.scans
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert scans" ON public.scans;
DROP POLICY IF EXISTS "Anyone can view scans" ON public.scans;

-- Create new policies that require authentication
CREATE POLICY "Authenticated users can insert their own scans"
ON public.scans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all scans"
ON public.scans
FOR SELECT
USING (auth.uid() IS NOT NULL);