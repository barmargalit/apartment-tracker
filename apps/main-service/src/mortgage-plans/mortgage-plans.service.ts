import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { MortgagePlanEntity } from './mortgage-plan.entity';

export interface CreateMortgagePlanDto {
  total_loan: number;
  bank_id?: string | null;
}

export interface UpdateMortgagePlanDto {
  total_loan?: number;
  bank_id?: string | null;
}

@Injectable()
export class MortgagePlansService {
  private readonly logger = new Logger(MortgagePlansService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<MortgagePlanEntity[]> {
    this.logger.log('Fetching all mortgage plans');
    const result = await this.pool.query<MortgagePlanEntity>(
      'SELECT * FROM mortgage_plans WHERE state = 0 ORDER BY created DESC',
    );
    return result.rows;
  }

  async findOne(id: string): Promise<MortgagePlanEntity> {
    this.logger.log(`Fetching mortgage plan id="${id}"`);
    const result = await this.pool.query<MortgagePlanEntity>(
      'SELECT * FROM mortgage_plans WHERE id = $1 AND state = 0',
      [id],
    );
    return result.rows[0];
  }

  async create(dto: CreateMortgagePlanDto): Promise<MortgagePlanEntity> {
    this.logger.log(`Creating mortgage plan total_loan="${dto.total_loan}"`);
    const result = await this.pool.query<MortgagePlanEntity>(
      `INSERT INTO mortgage_plans (total_loan, bank_id)
       VALUES ($1, $2)
       RETURNING *`,
      [dto.total_loan, dto.bank_id ?? null],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateMortgagePlanDto): Promise<MortgagePlanEntity> {
    this.logger.log(`Updating mortgage plan id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.total_loan !== undefined) { fields.push(`total_loan = $${idx++}`); values.push(dto.total_loan); }
    if (dto.bank_id !== undefined)    { fields.push(`bank_id = $${idx++}`);    values.push(dto.bank_id); }

    values.push(id);
    const result = await this.pool.query<MortgagePlanEntity>(
      `UPDATE mortgage_plans SET ${fields.join(', ')} WHERE id = $${idx} AND state = 0 RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting mortgage plan id="${id}"`);
    await this.pool.query('UPDATE mortgage_plans SET state = 1 WHERE id = $1', [id]);
  }
}
