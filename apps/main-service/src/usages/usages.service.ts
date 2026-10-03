import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { UsageEntity, BillType } from './usage.entity';
import { UsageBounds } from '@xpensive/types';

export interface CreateUsageDto {
  datetime: string;
  type: BillType;
  usage: number;
}

export interface UsageFilterDto {
  type: BillType;
  from?: string;
  to?: string;
}

@Injectable()
export class UsagesService {
  private readonly logger = new Logger(UsagesService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByType(filter: UsageFilterDto): Promise<UsageEntity[]> {
    const conditions: string[] = ['state = 0', 'type = $1'];
    const values: unknown[] = [filter.type];

    if (filter.from) {
      values.push(filter.from);
      conditions.push(`datetime >= $${values.length}`);
    }
    if (filter.to) {
      values.push(filter.to);
      conditions.push(`datetime <= $${values.length}`);
    }

    const result = await this.pool.query<UsageEntity>(
      `SELECT * FROM usages WHERE ${conditions.join(' AND ')} ORDER BY datetime ASC`,
      values,
    );
    return result.rows;
  }

  async getBounds(type: BillType): Promise<UsageBounds> {
    const result = await this.pool.query<{ first: string | null; last: string | null }>(
      `SELECT MIN(datetime)::text AS first, MAX(datetime)::text AS last FROM usages WHERE state = 0 AND type = $1`,
      [type],
    );
    return result.rows[0] ?? { first: null, last: null };
  }

  async createMany(dtos: CreateUsageDto[]): Promise<UsageEntity[]> {
    if (dtos.length === 0) return [];

    const placeholders = dtos.map(
      (_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`,
    );
    const values = dtos.flatMap((dto) => [dto.datetime, dto.type, dto.usage]);

    const result = await this.pool.query<UsageEntity>(
      `INSERT INTO usages (datetime, type, usage) VALUES ${placeholders.join(', ')} ON CONFLICT (datetime, type) DO NOTHING RETURNING *`,
      values,
    );
    return result.rows;
  }
}
