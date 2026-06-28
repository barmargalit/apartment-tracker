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
}
