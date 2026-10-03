import { BaseEntity } from '../database/base.entity';
import { MortgagePlan } from '@xpensive/types';

export class MortgagePlanEntity extends BaseEntity implements MortgagePlan {
  total_loan: number;
  bank_id: string | null;
}
