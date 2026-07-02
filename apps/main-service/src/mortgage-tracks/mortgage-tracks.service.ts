import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { MortgageTrackEntity } from './mortgage-track.entity';
import { MortgageTrackType, MortgageTrackData } from '@apartment-tracker/types';

export interface CreateMortgageTrackDto {
  plan_id: string;
  type: MortgageTrackType;
  amount: number;
  years: number;
  months: number;
  data: MortgageTrackData;
}

export interface UpdateMortgageTrackDto {
  type?: MortgageTrackType;
  amount?: number;
  years?: number;
  months?: number;
  data?: MortgageTrackData;
}

@Injectable()
export class MortgageTracksService {
  private readonly logger = new Logger(MortgageTracksService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByPlan(planId: string): Promise<MortgageTrackEntity[]> {
    this.logger.log(`Fetching mortgage tracks for plan_id="${planId}"`);
    const result = await this.pool.query<MortgageTrackEntity>(
      'SELECT * FROM mortgage_tracks WHERE plan_id = $1 AND state = 0 ORDER BY created DESC',
      [planId],
    );
    return result.rows;
  }

  async create(dto: CreateMortgageTrackDto): Promise<MortgageTrackEntity> {
    this.logger.log(`Creating mortgage track type="${dto.type}" plan_id="${dto.plan_id}"`);
    const result = await this.pool.query<MortgageTrackEntity>(
      `INSERT INTO mortgage_tracks (plan_id, type, amount, years, months, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [dto.plan_id, dto.type, dto.amount, dto.years, dto.months, JSON.stringify(dto.data)],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateMortgageTrackDto): Promise<MortgageTrackEntity> {
    this.logger.log(`Updating mortgage track id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.type !== undefined)   { fields.push(`type = $${idx++}`);   values.push(dto.type); }
    if (dto.amount !== undefined) { fields.push(`amount = $${idx++}`); values.push(dto.amount); }
    if (dto.years !== undefined)  { fields.push(`years = $${idx++}`);  values.push(dto.years); }
    if (dto.months !== undefined) { fields.push(`months = $${idx++}`); values.push(dto.months); }
    if (dto.data !== undefined)   { fields.push(`data = $${idx++}`);   values.push(JSON.stringify(dto.data)); }

    values.push(id);
    const result = await this.pool.query<MortgageTrackEntity>(
      `UPDATE mortgage_tracks SET ${fields.join(', ')} WHERE id = $${idx} AND state = 0 RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting mortgage track id="${id}"`);
    await this.pool.query('UPDATE mortgage_tracks SET state = 1 WHERE id = $1', [id]);
  }
}
