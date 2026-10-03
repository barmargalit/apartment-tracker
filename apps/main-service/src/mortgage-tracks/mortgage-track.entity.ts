import { BaseEntity } from '../database/base.entity';
import { MortgageTrack, MortgageTrackType, MortgageTrackData } from '@xpensive/types';

export class MortgageTrackEntity extends BaseEntity implements MortgageTrack {
  plan_id: string;
  type: MortgageTrackType;
  amount: number;
  years: number;
  months: number;
  data: MortgageTrackData;
}
