import { BillType } from './bill';

export interface Provider {
  id: string;
  created: Date;
  modified: Date;
  /** 0 = active, 1 = deleted */
  state: number;
  name: string;
  types: BillType[];
}
