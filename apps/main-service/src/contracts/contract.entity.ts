import { Contract, ContractData } from '@xpensive/types';
import { BillType } from '../bills/bill.entity';
import { BaseEntity } from '../database/base.entity';

export class ContractEntity extends BaseEntity implements Contract {
  bill_type: BillType;
  provider_id: string;
  residence_id: string | null;
  resident_id: string | null;
  monthly_price: number;
  start_date: string;
  end_date: string | null;
  comment: string | null;
  data: ContractData;
}
