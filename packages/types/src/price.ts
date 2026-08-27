import { BillType } from './bill';

export interface Price {
  id: string;
  created: Date;
  modified: Date;
  state: number;
  type: BillType;
  price: number;
  provider_id: string | null;
  valid_from: Date;
  comment: string | null;
}

export interface PriceHistory {
  id: string;
  created: Date;
  modified: Date;
  state: number;
  type: BillType;
  price: number;
  provider_id: string | null;
  valid_from: Date;
  comment: string | null;
}
