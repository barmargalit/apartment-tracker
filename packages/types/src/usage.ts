import { BillType } from './bill';

export interface Usage {
  id: string;
  created: Date;
  modified: Date;
  state: number;
  datetime: Date;
  type: BillType;
  usage: number;
}
