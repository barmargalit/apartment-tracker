ALTER TABLE usages ADD CONSTRAINT usages_datetime_type_unique UNIQUE (datetime, type);
