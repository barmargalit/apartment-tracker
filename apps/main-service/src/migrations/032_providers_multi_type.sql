ALTER TABLE providers ADD COLUMN types jsonb NOT NULL DEFAULT '[]'::jsonb;
UPDATE providers SET types = to_jsonb(ARRAY[type]);
ALTER TABLE providers DROP COLUMN type;
