import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'shop_db',
  user: process.env.DB_USER || 'shop_user',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
});

// Thư viện chính để truy vấn database
export const query = (text, params) => pool.query(text, params);

// Dùng cho các giao dịch nhiều bước (transaction)
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
