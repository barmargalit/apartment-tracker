import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { BillEntity, BillType } from './bill.entity';
import { BillData } from '@apartment-tracker/types';

export interface CreateBillDto {
  type: BillType;
  start_date: string;
  end_date: string;
  price: number;
  data: BillData;
  provider_id?: string | null;
  residence_id?: string | null;
}

export interface UpdateBillDto {
  type?: BillType;
  start_date?: string;
  end_date?: string;
  price?: number;
  data?: BillData;
  provider_id?: string | null;
  residence_id?: string | null;
}

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByType(type: BillType): Promise<BillEntity[]> {
    this.logger.log(`Fetching bills of type "${type}"`);
    const result = await this.pool.query<BillEntity>(
      'SELECT * FROM bills WHERE type = $1 AND state = 0 ORDER BY start_date ASC',
      [type],
    );
    return result.rows;
  }

  async create(dto: CreateBillDto): Promise<BillEntity> {
    this.logger.log(`Creating bill of type "${dto.type}"`);
    const result = await this.pool.query<BillEntity>(
      `INSERT INTO bills (type, start_date, end_date, price, data, provider_id, residence_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [dto.type, dto.start_date, dto.end_date, dto.price, JSON.stringify(dto.data), dto.provider_id ?? null, dto.residence_id ?? null],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateBillDto): Promise<BillEntity> {
    this.logger.log(`Updating bill id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.type !== undefined)        { fields.push(`type = $${idx++}`);        values.push(dto.type); }
    if (dto.start_date !== undefined)  { fields.push(`start_date = $${idx++}`);  values.push(dto.start_date); }
    if (dto.end_date !== undefined)    { fields.push(`end_date = $${idx++}`);    values.push(dto.end_date); }
    if (dto.price !== undefined)       { fields.push(`price = $${idx++}`);       values.push(dto.price); }
    if (dto.data !== undefined)        { fields.push(`data = $${idx++}`);        values.push(JSON.stringify(dto.data)); }
    if (dto.provider_id !== undefined)  { fields.push(`provider_id = $${idx++}`);  values.push(dto.provider_id); }
    if (dto.residence_id !== undefined) { fields.push(`residence_id = $${idx++}`); values.push(dto.residence_id); }

    values.push(id);
    const result = await this.pool.query<BillEntity>(
      `UPDATE bills SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting bill id="${id}"`);
    await this.pool.query('UPDATE bills SET state = 1 WHERE id = $1', [id]);
  }
}
