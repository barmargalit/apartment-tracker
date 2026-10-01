CREATE TYPE contract_offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

CREATE TABLE contract_offers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  state         SMALLINT NOT NULL DEFAULT 0,
  contract_id   UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  provider_id   UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  bill_type     bill_type NOT NULL,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  received_date DATE NOT NULL,
  status        contract_offer_status NOT NULL DEFAULT 'pending',
  comment       VARCHAR(200),
  data          JSONB NOT NULL DEFAULT '{}'
);

CREATE TRIGGER set_contract_offers_modified
  BEFORE UPDATE ON contract_offers
  FOR EACH ROW EXECUTE FUNCTION set_modified();
