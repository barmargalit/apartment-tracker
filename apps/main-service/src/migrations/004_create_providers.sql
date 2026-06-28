CREATE TABLE providers (
  id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  created  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  modified TIMESTAMPTZ  NOT NULL DEFAULT now(),
  state    SMALLINT     NOT NULL DEFAULT 0,
  name     VARCHAR(50)  NOT NULL
);

CREATE TRIGGER providers_set_modified
BEFORE UPDATE ON providers
FOR EACH ROW EXECUTE FUNCTION set_modified();
