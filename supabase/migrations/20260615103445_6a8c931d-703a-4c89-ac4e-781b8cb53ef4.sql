
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL,
  run_category TEXT NOT NULL DEFAULT 'Community Run 5K',
  tshirt_size TEXT NOT NULL,
  first_run TEXT NOT NULL,
  emergency_name TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  medical_conditions TEXT NOT NULL,
  liability_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register" ON public.registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
