import { ContractData } from './contract';
import { BillType } from './bill';

export type ContractOfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface ContractOffer {
  id: string;
  created: Date;
  modified: Date;
  /** 0 = active, 1 = deleted */
  state: number;
  contract_id: string;
  provider_id: string;
  bill_type: BillType;
  monthly_price: number;
  received_date: string;
  status: ContractOfferStatus;
  comment: string | null;
  data: ContractData;
}
