import { BaseEntity } from '../database/base.entity';
import { Provider } from '@apartment-tracker/types';

export class ProviderEntity extends BaseEntity implements Provider {
  name: string;
}
