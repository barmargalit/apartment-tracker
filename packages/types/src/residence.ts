export interface UtilitySettings {
  provider_id?: string | null;
  meter_numbers?: string[];
}

export interface Residence {
  id: string;
  created: Date;
  modified: Date;
  /** 0 = active, 1 = deleted */
  state: number;
  city: string;
  street: string;
  /** 0 = previous, 1 = current */
  current: number;
  start_date: Date;
  end_date: Date | null;
  electric_settings: UtilitySettings;
  water_settings: UtilitySettings;
}
