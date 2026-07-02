import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { BankEntity } from './bank.entity';

export interface CreateBankDto {
  name: string;
}

export interface UpdateBankDto {
  name?: string;
}

@Injectable()
export class BanksService {
  private readonly logger = new Logger(BanksService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<BankEntity[]> {
    this.logger.log('Fetching all banks');
    const result = await this.pool.query<BankEntity>(
      'SELECT * FROM banks WHERE state = 0 ORDER BY created DESC',
    );
    return result.rows;
  }

  async findOne(id: string): Promise<BankEntity> {
    this.logger.log(`Fetching bank id="${id}"`);
    const result = await this.pool.query<BankEntity>(
      'SELECT * FROM banks WHERE id = $1 AND state = 0',
      [id],
    );
    return result.rows[0];
  }

  async create(dto: CreateBankDto): Promise<BankEntity> {
    this.logger.log(`Creating bank "${dto.name}"`);
    const result = await this.pool.query<BankEntity>(
      `INSERT INTO banks (name)
       VALUES ($1)
       RETURNING *`,
      [dto.name],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateBankDto): Promise<BankEntity> {
    this.logger.log(`Updating bank id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.name !== undefined) { fields.push(`name = $${idx++}`); values.push(dto.name); }

    values.push(id);
    const result = await this.pool.query<BankEntity>(
      `UPDATE banks SET ${fields.join(', ')} WHERE id = $${idx} AND state = 0 RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting bank id="${id}"`);
    await this.pool.query('UPDATE banks SET state = 1 WHERE id = $1', [id]);
  }
}
