import { ContractData, ContractOffer, ContractOfferStatus } from '@apartment-tracker/types';
import { BillType } from '../bills/bill.entity';
import { BaseEntity } from '../database/base.entity';

export class ContractOfferEntity extends BaseEntity implements ContractOffer {
  contract_id: string;
  provider_id: string;
  bill_type: BillType;
  monthly_price: number;
  received_date: string;
  status: ContractOfferStatus;
  comment: string | null;
  data: ContractData;
}
