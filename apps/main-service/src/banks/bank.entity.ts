import { BaseEntity } from '../database/base.entity';
import { Bank } from '@apartment-tracker/types';

export class BankEntity extends BaseEntity implements Bank {
  name: string;
}
