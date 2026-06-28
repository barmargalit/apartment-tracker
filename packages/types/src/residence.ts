export interface Residence {
  id: string;
  created: Date;
  modified: Date;
  /** 0 = active, 1 = deleted */
  state: number;
  city: string;
  street: string;
}
