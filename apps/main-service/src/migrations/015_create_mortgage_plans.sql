CREATE TABLE mortgage_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  state INTEGER NOT NULL DEFAULT 0,
  total_loan NUMERIC NOT NULL,
  bank_id UUID REFERENCES banks(id)
);
