import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { ProviderEntity } from './provider.entity';
import { BillType } from '@xpensive/types';

export interface CreateProviderDto {
  name: string;
  types: BillType[];
}

export interface UpdateProviderDto {
  name?: string;
  types?: BillType[];
}

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(type?: BillType): Promise<ProviderEntity[]> {
    this.logger.log(type ? `Fetching providers of type "${type}"` : 'Fetching all providers');
    const result = type
      ? await this.pool.query<ProviderEntity>(
          'SELECT * FROM providers WHERE state = 0 AND types ? $1 ORDER BY name ASC',
          [type],
        )
      : await this.pool.query<ProviderEntity>(
          'SELECT * FROM providers WHERE state = 0 ORDER BY name ASC',
        );
    return result.rows;
  }

  async findOne(id: string): Promise<ProviderEntity> {
    this.logger.log(`Fetching provider id="${id}"`);
    const result = await this.pool.query<ProviderEntity>(
      'SELECT * FROM providers WHERE id = $1 AND state = 0',
      [id],
    );
    return result.rows[0];
  }

  async create(dto: CreateProviderDto): Promise<ProviderEntity> {
    this.logger.log(`Creating provider name="${dto.name}" types="${dto.types}"`);
    const result = await this.pool.query<ProviderEntity>(
      `INSERT INTO providers (name, types) VALUES ($1, $2) RETURNING *`,
      [dto.name, JSON.stringify(dto.types)],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateProviderDto): Promise<ProviderEntity> {
    this.logger.log(`Updating provider id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.name !== undefined) { fields.push(`name = $${idx++}`); values.push(dto.name); }
    if (dto.types !== undefined) { fields.push(`types = $${idx++}`); values.push(JSON.stringify(dto.types)); }

    values.push(id);
    const result = await this.pool.query<ProviderEntity>(
      `UPDATE providers SET ${fields.join(', ')} WHERE id = $${idx} AND state = 0 RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting provider id="${id}"`);
    await this.pool.query('UPDATE providers SET state = 1 WHERE id = $1', [id]);
  }
}
