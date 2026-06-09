const { pool } = require('./neon');

async function ensureRuntimeSchema() {
  await pool.query('alter table if exists profiles add column if not exists password_hash text');
  await pool.query('alter table if exists contact_messages add column if not exists is_read boolean default false');
}

module.exports = { ensureRuntimeSchema };
