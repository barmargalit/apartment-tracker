import { BaseEntity } from '../database/base.entity';
import { Bank } from '@xpensive/types';

export class BankEntity extends BaseEntity implements Bank {
  name: string;
}
