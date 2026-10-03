import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { ResidenceEntity } from './residence.entity';
import { UtilitySettings } from '@xpensive/types';

export interface CreateResidenceDto {
  city: string;
  street: string;
  current?: number;
  start_date: string;
  end_date?: string | null;
  electric_settings?: UtilitySettings;
  water_settings?: UtilitySettings;
}

export interface UpdateResidenceDto {
  city?: string;
  street?: string;
  current?: number;
  start_date?: string;
  end_date?: string | null;
  electric_settings?: UtilitySettings;
  water_settings?: UtilitySettings;
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
      `INSERT INTO residences (city, street, current, start_date, end_date, electric_settings, water_settings) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [dto.city, dto.street, dto.current ?? 0, dto.start_date, dto.end_date ?? null, JSON.stringify(dto.electric_settings ?? {}), JSON.stringify(dto.water_settings ?? {})],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateResidenceDto): Promise<ResidenceEntity> {
    this.logger.log(`Updating residence id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.city !== undefined)               { fields.push(`city = $${idx++}`);               values.push(dto.city); }
    if (dto.street !== undefined)             { fields.push(`street = $${idx++}`);             values.push(dto.street); }
    if (dto.current !== undefined)            { fields.push(`current = $${idx++}`);            values.push(dto.current); }
    if (dto.start_date !== undefined)         { fields.push(`start_date = $${idx++}`);         values.push(dto.start_date); }
    if (dto.end_date !== undefined)           { fields.push(`end_date = $${idx++}`);           values.push(dto.end_date); }
    if (dto.electric_settings !== undefined)  { fields.push(`electric_settings = $${idx++}`);  values.push(JSON.stringify(dto.electric_settings)); }
    if (dto.water_settings !== undefined)     { fields.push(`water_settings = $${idx++}`);     values.push(JSON.stringify(dto.water_settings)); }

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
