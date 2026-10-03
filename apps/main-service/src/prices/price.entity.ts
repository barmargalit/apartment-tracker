import { BaseEntity } from '../database/base.entity';
import { Price, PriceHistory, BillType } from '@xpensive/types';

export class PriceEntity extends BaseEntity implements Price {
  type: BillType;
  price: number;
  provider_id: string | null;
  valid_from: Date;
  comment: string | null;
}

export class PriceHistoryEntity extends BaseEntity implements PriceHistory {
  type: BillType;
  price: number;
  provider_id: string | null;
  valid_from: Date;
  comment: string | null;
}
