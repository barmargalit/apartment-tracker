CREATE TYPE bill_type AS ENUM ('electric', 'water', 'internet', 'gas');

CREATE TABLE bills (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created     TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified    TIMESTAMPTZ NOT NULL DEFAULT now(),
  type        bill_type   NOT NULL,
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ NOT NULL,
  data        JSONB       NOT NULL DEFAULT '{}'
);

CREATE OR REPLACE FUNCTION set_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bills_set_modified
BEFORE UPDATE ON bills
FOR EACH ROW EXECUTE FUNCTION set_modified();
