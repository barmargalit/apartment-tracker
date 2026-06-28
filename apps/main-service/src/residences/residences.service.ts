import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { ResidenceEntity } from './residence.entity';

export interface CreateResidenceDto {
  city: string;
  street: string;
}

export interface UpdateResidenceDto {
  city?: string;
  street?: string;
}

@Injectable()
export class ResidencesService {
  private readonly logger = new Logger(ResidencesService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<ResidenceEntity[]> {
    this.logger.log('Fetching all residences');
    const result = await this.pool.query<ResidenceEntity>(
      'SELECT * FROM residences WHERE state = 0 ORDER BY city ASC, street ASC',
    );
    return result.rows;
  }

  async findOne(id: string): Promise<ResidenceEntity> {
    this.logger.log(`Fetching residence id="${id}"`);
    const result = await this.pool.query<ResidenceEntity>(
      'SELECT * FROM residences WHERE id = $1 AND state = 0',
      [id],
    );
    return result.rows[0];
  }

  async create(dto: CreateResidenceDto): Promise<ResidenceEntity> {
    this.logger.log(`Creating residence city="${dto.city}" street="${dto.street}"`);
    const result = await this.pool.query<ResidenceEntity>(
      `INSERT INTO residences (city, street) VALUES ($1, $2) RETURNING *`,
      [dto.city, dto.street],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateResidenceDto): Promise<ResidenceEntity> {
    this.logger.log(`Updating residence id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.city !== undefined)   { fields.push(`city = $${idx++}`);   values.push(dto.city); }
    if (dto.street !== undefined) { fields.push(`street = $${idx++}`); values.push(dto.street); }

    values.push(id);
    const result = await this.pool.query<ResidenceEntity>(
      `UPDATE residences SET ${fields.join(', ')} WHERE id = $${idx} AND state = 0 RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting residence id="${id}"`);
    await this.pool.query('UPDATE residences SET state = 1 WHERE id = $1', [id]);
  }
}
