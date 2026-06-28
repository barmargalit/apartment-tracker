import { BaseEntity } from '../database/base.entity';
import { Residence } from '@apartment-tracker/types';

export class ResidenceEntity extends BaseEntity implements Residence {
  city: string;
  street: string;
  current: number;
  start_date: Date;
  end_date: Date | null;
}
