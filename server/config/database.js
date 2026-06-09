const { randomUUID } = require('crypto');
const { pool } = require('../db/neon');

const IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function assertIdent(value) {
  if (!IDENT.test(value)) throw new Error(`Invalid SQL identifier: ${value}`);
  return value;
}

function columnsFromSelect(select) {
  if (!select || select.includes('*') || select.includes('(')) return '*';
  return select
    .split(',')
    .map(col => assertIdent(col.trim()))
    .join(', ');
}

function asJson(value) {
  return value && typeof value === 'object' ? JSON.stringify(value) : value;
}

function firstRows(result, single, maybeSingle) {
  if (single || maybeSingle) return result.rows[0] || null;
  return result.rows;
}

async function expandRows(table, rows, select) {
  if (!rows?.length || !select?.includes('(')) return rows;

  if (table === 'products' && select.includes('characters')) {
    const ids = [...new Set(rows.map(row => row.character_id).filter(Boolean))];
    if (!ids.length) return rows;
    const chars = await pool.query('select * from characters where id = any($1)', [ids]);
    const byId = new Map(chars.rows.map(row => [row.id, row]));
    return rows.map(row => ({ ...row, characters: byId.get(row.character_id) || null }));
  }

  if (table === 'characters' && select.includes('products')) {
    const ids = rows.map(row => row.id);
    const products = await pool.query('select * from products where character_id = any($1)', [ids]);
    const byCharacter = new Map();
    for (const product of products.rows) {
      const list = byCharacter.get(product.character_id) || [];
      list.push(product);
      byCharacter.set(product.character_id, list);
    }
    return rows.map(row => ({ ...row, products: byCharacter.get(row.id) || [] }));
  }

  if (table === 'promotions' && select.includes('characters')) {
    const ids = [...new Set(rows.map(row => row.character_id).filter(Boolean))];
    const chars = ids.length ? await pool.query('select * from characters where id = any($1)', [ids]) : { rows: [] };
    const byId = new Map(chars.rows.map(row => [row.id, row]));
    const promoIds = rows.map(row => row.id);
    const items = select.includes('promotion_signature_items') && promoIds.length
      ? await pool.query('select * from promotion_signature_items where promotion_id = any($1) order by sort_order asc', [promoIds])
      : { rows: [] };
    const byPromo = new Map();
    for (const item of items.rows) {
      const list = byPromo.get(item.promotion_id) || [];
      list.push(item);
      byPromo.set(item.promotion_id, list);
    }
    return rows.map(row => ({
      ...row,
      characters: byId.get(row.character_id) || null,
      promotion_signature_items: byPromo.get(row.id) || [],
    }));
  }

  if (table === 'orders' && select.includes('order_items')) {
    return Promise.all(rows.map(expandOrder));
  }

  return rows;
}

async function expandOrder(order) {
  const itemsResult = await pool.query('select * from order_items where order_id = $1', [order.id]);
  const productIds = [...new Set(itemsResult.rows.map(row => row.product_id).filter(Boolean))];
  const products = productIds.length
    ? await pool.query('select * from products where id = any($1)', [productIds])
    : { rows: [] };
  const characterIds = [...new Set(products.rows.map(row => row.character_id).filter(Boolean))];
  const characters = characterIds.length
    ? await pool.query('select * from characters where id = any($1)', [characterIds])
    : { rows: [] };
  const charsById = new Map(characters.rows.map(row => [row.id, row]));
  const productsById = new Map(products.rows.map(row => [row.id, { ...row, characters: charsById.get(row.character_id) || null }]));

  const profile = order.user_id
    ? await pool.query('select full_name, email from profiles where id = $1 limit 1', [order.user_id])
    : { rows: [] };

  return {
    ...order,
    profiles: profile.rows[0] || null,
    order_items: itemsResult.rows.map(item => ({ ...item, products: productsById.get(item.product_id) || null })),
  };
}

class QueryBuilder {
  constructor(table) {
    this.table = assertIdent(table);
    this._select = '*';
    this._filters = [];
    this._orders = [];
    this._limit = null;
    this._offset = null;
    this._single = false;
    this._maybeSingle = false;
    this._head = false;
    this._count = false;
    this._mutation = null;
    this._returning = false;
  }

  select(select = '*', options = {}) {
    this._select = select;
    this._head = Boolean(options.head);
    this._count = options.count === 'exact';
    this._returning = Boolean(this._mutation);
    return this;
  }

  insert(rows) { this._mutation = { type: 'insert', rows: Array.isArray(rows) ? rows : [rows] }; return this; }
  update(values) { this._mutation = { type: 'update', values }; return this; }
  delete() { this._mutation = { type: 'delete' }; return this; }
  eq(col, val) { this._filters.push({ op: '=', col, val }); return this; }
  lt(col, val) { this._filters.push({ op: '<', col, val }); return this; }
  lte(col, val) { this._filters.push({ op: '<=', col, val }); return this; }
  gte(col, val) { this._filters.push({ op: '>=', col, val }); return this; }
  ilike(col, val) { this._filters.push({ op: 'ilike', col, val }); return this; }
  in(col, vals) { this._filters.push({ op: 'in', col, val: vals || [] }); return this; }
  or(raw) { this._filters.push({ op: 'or', raw }); return this; }
  order(col, options = {}) { this._orders.push({ col, ascending: options.ascending !== false }); return this; }
  range(from, to) { this._offset = Number(from); this._limit = Number(to) - Number(from) + 1; return this; }
  limit(value) { this._limit = Number(value); return this; }
  single() { this._single = true; this._limit = 1; return this; }
  maybeSingle() { this._maybeSingle = true; this._limit = 1; return this; }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  buildWhere(values) {
    if (!this._filters.length) return '';
    const clauses = [];
    for (const filter of this._filters) {
      if (filter.op === 'or') {
        const search = String(filter.raw || '').match(/%(.+)%/)?.[1] || '';
        values.push(`%${search}%`);
        const idx = values.length;
        clauses.push(`(order_number ilike $${idx} or shipping_name ilike $${idx})`);
        continue;
      }
      const col = assertIdent(filter.col);
      if (filter.op === 'in') {
        values.push(filter.val);
        clauses.push(`${col} = any($${values.length})`);
      } else {
        values.push(filter.val);
        clauses.push(`${col} ${filter.op} $${values.length}`);
      }
    }
    return ` where ${clauses.join(' and ')}`;
  }

  async execute() {
    try {
      if (this._mutation?.type === 'insert') return await this.executeInsert();
      if (this._mutation?.type === 'update') return await this.executeUpdate();
      if (this._mutation?.type === 'delete') return await this.executeDelete();
      return await this.executeSelect();
    } catch (error) {
      return { data: null, error };
    }
  }

  async executeSelect() {
    const values = [];
    const where = this.buildWhere(values);
    if (this._head && this._count) {
      const result = await pool.query(`select count(*)::int as count from ${this.table}${where}`, values);
      return { data: null, error: null, count: result.rows[0]?.count || 0 };
    }

    let sql = `select ${columnsFromSelect(this._select)} from ${this.table}${where}`;
    if (this._orders.length) {
      sql += ' order by ' + this._orders.map(o => `${assertIdent(o.col)} ${o.ascending ? 'asc' : 'desc'}`).join(', ');
    }
    if (this._limit != null) {
      values.push(this._limit);
      sql += ` limit $${values.length}`;
    }
    if (this._offset != null) {
      values.push(this._offset);
      sql += ` offset $${values.length}`;
    }

    const result = await pool.query(sql, values);
    const expanded = await expandRows(this.table, result.rows, this._select);
    return { data: firstRows({ rows: expanded }, this._single, this._maybeSingle), error: null };
  }

  async executeInsert() {
    const rows = this._mutation.rows.map(row => ({ id: row.id || randomUUID(), ...row }));
    if (!rows.length) return { data: [], error: null };
    const cols = Object.keys(rows[0]).filter(col => rows.some(row => row[col] !== undefined));
    const values = [];
    const tuples = rows.map(row => {
      const marks = cols.map(col => {
        values.push(asJson(row[col]));
        return `$${values.length}`;
      });
      return `(${marks.join(', ')})`;
    });
    const sql = `insert into ${this.table} (${cols.map(assertIdent).join(', ')}) values ${tuples.join(', ')} returning *`;
    const result = await pool.query(sql, values);
    return { data: firstRows(result, this._single, this._maybeSingle), error: null };
  }

  async executeUpdate() {
    const values = [];
    const sets = Object.entries(this._mutation.values)
      .filter(([, value]) => value !== undefined)
      .map(([col, value]) => {
        values.push(asJson(value));
        return `${assertIdent(col)} = $${values.length}`;
      });
    const where = this.buildWhere(values);
    const result = await pool.query(`update ${this.table} set ${sets.join(', ')}${where} returning *`, values);
    return { data: firstRows(result, this._single, this._maybeSingle), error: null };
  }

  async executeDelete() {
    const values = [];
    const where = this.buildWhere(values);
    await pool.query(`delete from ${this.table}${where}`, values);
    return { data: null, error: null };
  }
}

module.exports = {
  from(table) {
    return new QueryBuilder(table);
  },
  rpc(name, args = {}) {
    if (name === 'decrement_sig_item_stock') {
      return pool.query('update signature_items set stock_qty = greatest(0, stock_qty - $1) where id = $2', [args.qty, args.item_id])
        .then(() => ({ data: null, error: null }))
        .catch(error => ({ data: null, error }));
    }
    if (name === 'decrement_promo_stock') {
      return pool.query('update promotions set remaining_stock = greatest(0, remaining_stock - $1) where id = $2', [args.qty, args.promotion_id])
        .then(() => ({ data: null, error: null }))
        .catch(error => ({ data: null, error }));
    }
    return Promise.resolve({ data: null, error: new Error(`Unknown RPC: ${name}`) });
  },
  storage: {
    getBucket: async () => ({ data: null, error: null }),
    createBucket: async () => ({ data: null, error: null }),
    from: () => ({
      upload: async () => ({ data: null, error: new Error('Local upload path is handled by /api/upload') }),
      remove: async () => ({ data: null, error: null }),
      getPublicUrl: path => ({ data: { publicUrl: `/uploads/${path}` } }),
    }),
  },
};
