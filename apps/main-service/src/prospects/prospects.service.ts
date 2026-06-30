import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { ProspectEntity } from './prospect.entity';
import { SafeSpace } from '@apartment-tracker/types';

export interface CreateProspectDto {
  street: string;
  city: string;
  square_meters: number;
  balcony_square_meters?: number | null;
  rooms: number;
  parking: boolean;
  safe_space: SafeSpace;
  contractor?: string | null;
  comment?: string | null;
}

export interface UpdateProspectDto {
  street?: string;
  city?: string;
  square_meters?: number;
  balcony_square_meters?: number | null;
  rooms?: number;
  parking?: boolean;
  safe_space?: SafeSpace;
  contractor?: string | null;
  comment?: string | null;
}

@Injectable()
export class ProspectsService {
  private readonly logger = new Logger(ProspectsService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<ProspectEntity[]> {
    this.logger.log('Fetching all prospects');
    const result = await this.pool.query<ProspectEntity>(
      'SELECT * FROM prospects WHERE state = 0 ORDER BY created DESC',
    );
    return result.rows;
  }

  async create(dto: CreateProspectDto): Promise<ProspectEntity> {
    this.logger.log(`Creating prospect "${dto.street}, ${dto.city}"`);
    const result = await this.pool.query<ProspectEntity>(
      `INSERT INTO prospects (street, city, square_meters, balcony_square_meters, rooms, parking, safe_space, contractor, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [dto.street, dto.city, dto.square_meters, dto.balcony_square_meters ?? null, dto.rooms, dto.parking, dto.safe_space, dto.contractor ?? null, dto.comment ?? null],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateProspectDto): Promise<ProspectEntity> {
    this.logger.log(`Updating prospect id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.street !== undefined)               { fields.push(`street = $${idx++}`);                values.push(dto.street); }
    if (dto.city !== undefined)                 { fields.push(`city = $${idx++}`);                  values.push(dto.city); }
    if (dto.square_meters !== undefined)        { fields.push(`square_meters = $${idx++}`);         values.push(dto.square_meters); }
    if (dto.balcony_square_meters !== undefined){ fields.push(`balcony_square_meters = $${idx++}`); values.push(dto.balcony_square_meters); }
    if (dto.rooms !== undefined)                { fields.push(`rooms = $${idx++}`);                 values.push(dto.rooms); }
    if (dto.parking !== undefined)              { fields.push(`parking = $${idx++}`);               values.push(dto.parking); }
    if (dto.safe_space !== undefined)           { fields.push(`safe_space = $${idx++}`);            values.push(dto.safe_space); }
    if (dto.contractor !== undefined)           { fields.push(`contractor = $${idx++}`);            values.push(dto.contractor); }
    if (dto.comment !== undefined)              { fields.push(`comment = $${idx++}`);               values.push(dto.comment); }

    values.push(id);
    const result = await this.pool.query<ProspectEntity>(
      `UPDATE prospects SET ${fields.join(', ')} WHERE id = $${idx} AND state = 0 RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting prospect id="${id}"`);
    await this.pool.query('UPDATE prospects SET state = 1 WHERE id = $1', [id]);
  }
}
