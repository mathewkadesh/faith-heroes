require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const tables = [
    'characters',
    'profiles',
    'products',
    'signature_items',
    'promotions',
    'promotion_signature_items',
    'promo_codes',
    'orders',
    'order_items',
    'community_stories',
    'contact_messages',
  ];

  for (const table of tables) {
    const result = await pool.query(`select count(*)::int as count from ${table}`);
    console.log(`${table}: ${result.rows[0].count}`);
  }

  await pool.end();
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
