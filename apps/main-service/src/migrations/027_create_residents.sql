CREATE TABLE residents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  state      SMALLINT NOT NULL DEFAULT 0,
  name       VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL
);

CREATE TRIGGER set_residents_modified
  BEFORE UPDATE ON residents
  FOR EACH ROW EXECUTE FUNCTION set_modified();
