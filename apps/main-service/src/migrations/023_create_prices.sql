CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  state SMALLINT NOT NULL DEFAULT 0,
  type bill_type NOT NULL UNIQUE,
  price NUMERIC(10, 4) NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  comment TEXT
);

CREATE TRIGGER prices_set_modified
  BEFORE UPDATE ON prices
  FOR EACH ROW EXECUTE FUNCTION set_modified();

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  state SMALLINT NOT NULL DEFAULT 0,
  type bill_type NOT NULL,
  price NUMERIC(10, 4) NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  valid_from TIMESTAMPTZ NOT NULL,
  comment TEXT
);

CREATE TRIGGER price_history_set_modified
  BEFORE UPDATE ON price_history
  FOR EACH ROW EXECUTE FUNCTION set_modified();
