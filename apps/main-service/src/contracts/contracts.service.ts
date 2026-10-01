import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { ContractEntity } from './contract.entity';
import { BillType } from '../bills/bill.entity';
import { ContractData } from '@apartment-tracker/types';

export interface CreateContractDto {
  bill_type: BillType;
  provider_id: string;
  residence_id?: string | null;
  resident_id?: string | null;
  monthly_price: number;
  start_date: string;
  end_date?: string | null;
  comment?: string | null;
  data: ContractData;
}

export interface UpdateContractDto {
  bill_type?: BillType;
  provider_id?: string;
  residence_id?: string | null;
  resident_id?: string | null;
  monthly_price?: number;
  start_date?: string;
  end_date?: string | null;
  comment?: string | null;
  data?: ContractData;
}

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<ContractEntity[]> {
    this.logger.log('Fetching all contracts');
    const result = await this.pool.query<ContractEntity>(
      'SELECT * FROM contracts WHERE state = 0 ORDER BY start_date DESC',
    );
    return result.rows;
  }

  async findByType(type: BillType): Promise<ContractEntity[]> {
    this.logger.log(`Fetching contracts of type "${type}"`);
    const result = await this.pool.query<ContractEntity>(
      'SELECT * FROM contracts WHERE bill_type = $1 AND state = 0 ORDER BY start_date DESC',
      [type],
    );
    return result.rows;
  }

  async findOne(id: string): Promise<ContractEntity | null> {
    this.logger.log(`Fetching contract id="${id}"`);
    const result = await this.pool.query<ContractEntity>(
      'SELECT * FROM contracts WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(dto: CreateContractDto): Promise<ContractEntity> {
    this.logger.log(`Creating contract of type "${dto.bill_type}"`);
    const result = await this.pool.query<ContractEntity>(
      `INSERT INTO contracts (bill_type, provider_id, residence_id, resident_id, monthly_price, start_date, end_date, comment, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        dto.bill_type,
        dto.provider_id,
        dto.residence_id ?? null,
        dto.resident_id ?? null,
        dto.monthly_price,
        dto.start_date,
        dto.end_date ?? null,
        dto.comment ?? null,
        JSON.stringify(dto.data),
      ],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateContractDto): Promise<ContractEntity> {
    this.logger.log(`Updating contract id="${id}"`);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.bill_type !== undefined)      { fields.push(`bill_type = $${idx++}`);      values.push(dto.bill_type); }
    if (dto.provider_id !== undefined)    { fields.push(`provider_id = $${idx++}`);    values.push(dto.provider_id); }
    if (dto.residence_id !== undefined)   { fields.push(`residence_id = $${idx++}`);   values.push(dto.residence_id); }
    if (dto.resident_id !== undefined)    { fields.push(`resident_id = $${idx++}`);    values.push(dto.resident_id); }
    if (dto.monthly_price !== undefined)  { fields.push(`monthly_price = $${idx++}`);  values.push(dto.monthly_price); }
    if (dto.start_date !== undefined)     { fields.push(`start_date = $${idx++}`);     values.push(dto.start_date); }
    if (dto.end_date !== undefined)       { fields.push(`end_date = $${idx++}`);       values.push(dto.end_date); }
    if (dto.comment !== undefined)        { fields.push(`comment = $${idx++}`);        values.push(dto.comment); }
    if (dto.data !== undefined)           { fields.push(`data = $${idx++}`);           values.push(JSON.stringify(dto.data)); }

    values.push(id);
    const result = await this.pool.query<ContractEntity>(
      `UPDATE contracts SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async closeOutBefore(id: string, effectiveDate: string): Promise<ContractEntity> {
    this.logger.log(`Closing out contract id="${id}" before effective_date="${effectiveDate}"`);
    const result = await this.pool.query<ContractEntity>(
      `UPDATE contracts SET end_date = ($1::date - interval '1 day')::date WHERE id = $2 RETURNING *`,
      [effectiveDate, id],
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting contract id="${id}"`);
    await this.pool.query('UPDATE contracts SET state = 1 WHERE id = $1', [id]);
  }
}
