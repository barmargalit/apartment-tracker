ALTER TABLE residences
  ADD COLUMN IF NOT EXISTS electric_meter_numbers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS water_meter_numbers    text[] NOT NULL DEFAULT '{}';
