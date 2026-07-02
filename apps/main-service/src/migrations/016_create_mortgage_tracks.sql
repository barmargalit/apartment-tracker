CREATE TYPE mortgage_track_type AS ENUM ('fixed_index_linked', 'variable_index_linked', 'prime', 'fixed_unlinked', 'foreign_currency');

CREATE TABLE mortgage_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  state INTEGER NOT NULL DEFAULT 0,
  plan_id UUID NOT NULL REFERENCES mortgage_plans(id),
  type mortgage_track_type NOT NULL,
  amount NUMERIC NOT NULL,
  years INTEGER NOT NULL,
  months INTEGER NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'
);
