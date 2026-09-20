import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { ResidentEntity } from './resident.entity';

export interface CreateResidentDto {
  name: string;
  birth_date: string;
}

export interface UpdateResidentDto {
  name?: string;
  birth_date?: string;
}

@Injectable()
export class ResidentsService {
  private readonly logger = new Logger(ResidentsService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<ResidentEntity[]> {
    this.logger.log('Fetching all residents');
    const result = await this.pool.query<ResidentEntity>(
      'SELECT * FROM residents WHERE state = 0 ORDER BY name ASC',
    );
    return result.rows;
  }

  async create(dto: CreateResidentDto): Promise<ResidentEntity> {
    this.logger.log(`Creating resident "${dto.name}"`);
    const result = await this.pool.query<ResidentEntity>(
      'INSERT INTO residents (name, birth_date) VALUES ($1, $2) RETURNING *',
      [dto.name, dto.birth_date],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateResidentDto): Promise<ResidentEntity> {
    this.logger.log(`Updating resident id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.name !== undefined)       { fields.push(`name = $${idx++}`);       values.push(dto.name); }
    if (dto.birth_date !== undefined) { fields.push(`birth_date = $${idx++}`); values.push(dto.birth_date); }

    values.push(id);
    const result = await this.pool.query<ResidentEntity>(
      `UPDATE residents SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting resident id="${id}"`);
    await this.pool.query('UPDATE residents SET state = 1 WHERE id = $1', [id]);
  }
}
