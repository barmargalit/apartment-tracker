import { Resident } from '@apartment-tracker/types';
import { BaseEntity } from '../database/base.entity';

export class ResidentEntity extends BaseEntity implements Resident {
  name: string;
  birth_date: string;
}
