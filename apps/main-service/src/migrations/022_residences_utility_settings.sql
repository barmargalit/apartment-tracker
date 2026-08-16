ALTER TABLE residences
  DROP COLUMN IF EXISTS electric_meter_numbers,
  DROP COLUMN IF EXISTS water_meter_numbers,
  ADD COLUMN IF NOT EXISTS electric_settings jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS water_settings    jsonb NOT NULL DEFAULT '{}';
