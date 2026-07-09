
CREATE TABLE public.event_settings (
  id boolean PRIMARY KEY DEFAULT true,
  registration_open boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_settings_singleton CHECK (id = true)
);

GRANT SELECT ON public.event_settings TO anon, authenticated;
GRANT ALL ON public.event_settings TO service_role;

ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read event settings"
  ON public.event_settings FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.event_settings (id, registration_open) VALUES (true, true)
  ON CONFLICT (id) DO NOTHING;

-- Replace the registration insert policy with one that also enforces the server-side gate.
DROP POLICY IF EXISTS "Public can register with valid data" ON public.registrations;

CREATE POLICY "Public can register with valid data"
  ON public.registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (SELECT registration_open FROM public.event_settings WHERE id = true) = true
    AND liability_accepted = true
    AND length(btrim(full_name)) BETWEEN 2 AND 100
    AND length(btrim(phone)) BETWEEN 7 AND 20
    AND length(btrim(emergency_name)) BETWEEN 2 AND 100
    AND length(btrim(emergency_phone)) BETWEEN 7 AND 20
    AND age BETWEEN 5 AND 100
    AND tshirt_size = ANY (ARRAY['XS','S','M','L','XL','XXL','XXXL'])
    AND gender = ANY (ARRAY['Male','Female','Other','Prefer not to say'])
    AND blood_group = ANY (ARRAY['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'])
  );
