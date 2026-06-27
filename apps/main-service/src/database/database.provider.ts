import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export const DATABASE_POOL = 'DATABASE_POOL';

export const databaseProvider = {
  provide: DATABASE_POOL,
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const pool = new Pool({
      host: config.get<string>('db.host'),
      port: config.get<number>('db.port'),
      user: config.get<string>('db.username'),
      password: config.get<string>('db.password'),
      database: config.get<string>('db.name'),
    });

    await pool.query('SELECT 1');
    console.log('Postgres connection established');

    return pool;
  },
};
