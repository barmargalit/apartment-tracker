CREATE TABLE residences (
  id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  created  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  modified TIMESTAMPTZ  NOT NULL DEFAULT now(),
  state    SMALLINT     NOT NULL DEFAULT 0,
  city     VARCHAR(100) NOT NULL,
  street   VARCHAR(255) NOT NULL
);

CREATE TRIGGER residences_set_modified
BEFORE UPDATE ON residences
FOR EACH ROW EXECUTE FUNCTION set_modified();
