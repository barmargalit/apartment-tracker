CREATE TYPE safe_space_type AS ENUM ('Room', 'Floor', 'Building', 'None');

CREATE TABLE prospects (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created              TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified             TIMESTAMPTZ NOT NULL DEFAULT now(),
  state                INTEGER NOT NULL DEFAULT 0,
  street               TEXT NOT NULL,
  city                 TEXT NOT NULL,
  square_meters        NUMERIC NOT NULL,
  balcony_square_meters NUMERIC,
  rooms                NUMERIC NOT NULL,
  parking              BOOLEAN NOT NULL DEFAULT FALSE,
  safe_space           safe_space_type NOT NULL DEFAULT 'None',
  comment              TEXT
);
