-- 1. Table para sa user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  purok TEXT,
  role TEXT DEFAULT 'resident',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Email ug city columns sa cases table
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS complainant_email TEXT,
ADD COLUMN IF NOT EXISTS respondent_email TEXT,
ADD COLUMN IF NOT EXISTS complainant_city TEXT,
ADD COLUMN IF NOT EXISTS respondent_city TEXT,
ADD COLUMN IF NOT EXISTS screening_answers JSONB;

-- 3. Row Level Security ug mga polisiya para sa profiles ug cases tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for profiles" ON profiles;
CREATE POLICY "Enable all access for profiles"
ON profiles FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for cases" ON cases;
CREATE POLICY "Enable all access for cases"
ON cases FOR ALL
USING (true)
WITH CHECK (true);

--- 4. Pagdugang sa complainant_email, evidence_url, ug screening_answers columns sa cases table
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS complainant_email TEXT,
ADD COLUMN IF NOT EXISTS evidence_url TEXT,
ADD COLUMN IF NOT EXISTS screening_answers JSONB;

