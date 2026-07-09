-- Revoke broad table privileges from anon; keep INSERT only
REVOKE ALL ON public.registrations FROM anon;
REVOKE ALL ON public.registrations FROM authenticated;
GRANT INSERT ON public.registrations TO anon;
GRANT INSERT ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

-- Drop existing permissive insert policy
DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;

-- Stricter INSERT policy with field-level validation
CREATE POLICY "Public can register with valid data"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  liability_accepted = true
  AND length(btrim(full_name)) BETWEEN 2 AND 100
  AND length(btrim(phone)) BETWEEN 7 AND 20
  AND length(btrim(emergency_name)) BETWEEN 2 AND 100
  AND length(btrim(emergency_phone)) BETWEEN 7 AND 20
  AND age BETWEEN 5 AND 100
  AND tshirt_size IN ('XS','S','M','L','XL','XXL','XXXL')
  AND gender IN ('Male','Female','Other','Prefer not to say')
  AND blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown')
);

-- Explicitly deny SELECT/UPDATE/DELETE to anon and authenticated roles
CREATE POLICY "No public read of registrations"
ON public.registrations
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "No public update of registrations"
ON public.registrations
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No public delete of registrations"
ON public.registrations
FOR DELETE
TO anon, authenticated
USING (false);