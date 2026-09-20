import { BaseEntity } from '../database/base.entity';
import { Bill, BillData, BillType } from '@apartment-tracker/types';

export { BillType };

export class BillEntity extends BaseEntity implements Bill {
  type: BillType;
  start_date: Date;
  end_date: Date;
  price: number;
  data: BillData;
  provider_id: string | null;
  residence_id: string | null;
  resident_id: string | null;
  contract_id: string | null;
  comment: string | null;
}
