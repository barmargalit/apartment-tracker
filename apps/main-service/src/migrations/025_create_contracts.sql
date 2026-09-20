CREATE TABLE contracts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  state       SMALLINT NOT NULL DEFAULT 0,
  bill_type   bill_type NOT NULL,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  residence_id UUID REFERENCES residences(id) ON DELETE SET NULL,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date  DATE NOT NULL,
  end_date    DATE,
  comment     VARCHAR(200),
  data        JSONB NOT NULL DEFAULT '{}'
);

CREATE TRIGGER set_contracts_modified
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION set_modified();
