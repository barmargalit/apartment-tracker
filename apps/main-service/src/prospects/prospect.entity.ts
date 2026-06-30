import { BaseEntity } from '../database/base.entity';
import { Prospect, SafeSpace } from '@apartment-tracker/types';

export class ProspectEntity extends BaseEntity implements Prospect {
  street: string;
  city: string;
  square_meters: number;
  balcony_square_meters: number | null;
  rooms: number;
  parking: boolean;
  safe_space: SafeSpace;
  contractor: string | null;
  comment: string | null;
}
