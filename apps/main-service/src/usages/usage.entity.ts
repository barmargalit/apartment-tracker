import { BaseEntity } from '../database/base.entity';
import { Usage } from '@xpensive/types';
import { BillType } from '../bills/bill.entity';

export { BillType };

export class UsageEntity extends BaseEntity implements Usage {
  datetime: Date;
  type: BillType;
  usage: number;
}
