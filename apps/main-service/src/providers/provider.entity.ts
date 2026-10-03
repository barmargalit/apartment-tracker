import { BaseEntity } from '../database/base.entity';
import { BillType, Provider } from '@xpensive/types';

export class ProviderEntity extends BaseEntity implements Provider {
  name: string;
  types: BillType[];
}
