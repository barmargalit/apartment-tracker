import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { PriceEntity, PriceHistoryEntity } from './price.entity';
import { BillType } from '@apartment-tracker/types';

export interface UpsertPriceDto {
  type: BillType;
  price: number;
  provider_id?: string | null;
  valid_from?: string;
  comment?: string | null;
}

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findCurrentByType(type: BillType): Promise<PriceEntity | null> {
    this.logger.log(`Fetching current price for type="${type}"`);
    const result = await this.pool.query<PriceEntity>(
      'SELECT * FROM prices WHERE type = $1 AND state = 0',
      [type],
    );
    return result.rows[0] ?? null;
  }

  async findHistoryByType(type: BillType): Promise<PriceHistoryEntity[]> {
    this.logger.log(`Fetching price history for type="${type}"`);
    const result = await this.pool.query<PriceHistoryEntity>(
      'SELECT * FROM price_history WHERE type = $1 AND state = 0 ORDER BY valid_from ASC',
      [type],
    );
    return result.rows;
  }

  async updateHistory(id: string, dto: Partial<UpsertPriceDto>): Promise<PriceHistoryEntity> {
    this.logger.log(`Updating price_history id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.price !== undefined) { fields.push(`price = $${idx++}`); values.push(dto.price); }
    if (dto.provider_id !== undefined) { fields.push(`provider_id = $${idx++}`); values.push(dto.provider_id ?? null); }
    if (dto.valid_from !== undefined) { fields.push(`valid_from = $${idx++}`); values.push(new Date(dto.valid_from)); }
    if (dto.comment !== undefined) { fields.push(`comment = $${idx++}`); values.push(dto.comment ?? null); }

    values.push(id);
    const result = await this.pool.query<PriceHistoryEntity>(
      `UPDATE price_history SET ${fields.join(', ')} WHERE id = $${idx} AND state = 0 RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async upsert(dto: UpsertPriceDto): Promise<PriceEntity | PriceHistoryEntity> {
    this.logger.log(`Upserting price type="${dto.type}" price=${dto.price} valid_from=${dto.valid_from ?? 'now'}`);
    const validFrom = dto.valid_from ? new Date(dto.valid_from) : new Date();

    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query<PriceEntity>(
        'SELECT * FROM prices WHERE type = $1 AND state = 0',
        [dto.type],
      );
      const current = existing.rows[0] ?? null;

      // Past price: insert directly into history, do not touch current
      if (current && validFrom < new Date(current.valid_from)) {
        const result = await client.query<PriceHistoryEntity>(
          'INSERT INTO price_history (type, price, provider_id, valid_from, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [dto.type, dto.price, dto.provider_id ?? null, validFrom, dto.comment ?? null],
        );
        await client.query('COMMIT');
        return result.rows[0];
      }

      // New or equal date: becomes current price, old one moves to history
      if (current) {
        await client.query(
          'INSERT INTO price_history (type, price, provider_id, valid_from, comment) VALUES ($1, $2, $3, $4, $5)',
          [current.type, current.price, current.provider_id, current.valid_from, current.comment],
        );
        const result = await client.query<PriceEntity>(
          'UPDATE prices SET price = $1, provider_id = $2, valid_from = $3, comment = $4 WHERE id = $5 RETURNING *',
          [dto.price, dto.provider_id ?? null, validFrom, dto.comment ?? null, current.id],
        );
        await client.query('COMMIT');
        return result.rows[0];
      }

      // No current price yet: insert fresh
      const result = await client.query<PriceEntity>(
        'INSERT INTO prices (type, price, provider_id, valid_from, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [dto.type, dto.price, dto.provider_id ?? null, validFrom, dto.comment ?? null],
      );
      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
