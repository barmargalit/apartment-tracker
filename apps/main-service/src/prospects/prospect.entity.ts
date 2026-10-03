import { BaseEntity } from '../database/base.entity';
import { Prospect, SafeSpace } from '@xpensive/types';

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
  price: number | null;
  realtor: boolean;
  realtor_fee: number | null;
  floor_plan_url: string | null;
  video_url: string | null;
  floor: number | null;
  property_tax: number | null;
  building_fees: number | null;
  visited: Date | null;
  pros: string[];
  cons: string[];
}
