const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { pool } = require('../db/neon');
const { generateToken } = require('../middleware/auth');

function publicProfile(profile) {
  if (!profile) return null;
  const { password_hash, ...safe } = profile;
  return safe;
}

exports.register = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const fullName = req.body.full_name || req.body.fullName || '';
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password are required' });

    const existing = await pool.query('select id from profiles where email = $1 limit 1', [email]);
    if (existing.rows[0]) return res.status(409).json({ success: false, error: 'Email already registered' });

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'insert into profiles (id, email, full_name, role, password_hash) values ($1, $2, $3, $4, $5) returning *',
      [id, email, fullName, 'customer', passwordHash]
    );
    const profile = publicProfile(result.rows[0]);
    const token = generateToken(profile.id, profile.role);
    res.status(201).json({ success: true, data: { user: { id: profile.id, email: profile.email }, profile, token } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const result = await pool.query('select * from profiles where email = $1 limit 1', [email]);
    const profile = result.rows[0];
    if (!profile?.password_hash || !(await bcrypt.compare(password, profile.password_hash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const safeProfile = publicProfile(profile);
    const token = generateToken(safeProfile.id, safeProfile.role);
    res.json({ success: true, data: { user: { id: safeProfile.id, email: safeProfile.email }, profile: safeProfile, token } });
  } catch (err) { next(err); }
};

exports.getMe = (req, res) => {
  res.json({ success: true, data: { user: req.user, profile: publicProfile(req.profile) } });
};

exports.updateMe = async (req, res, next) => {
  try {
    const fullName = req.body.full_name ?? req.body.fullName;
    const result = await pool.query(
      'update profiles set full_name = coalesce($1, full_name) where id = $2 returning *',
      [fullName, req.user.id]
    );
    const profile = publicProfile(result.rows[0]);
    res.json({ success: true, data: { user: { id: profile.id, email: profile.email }, profile } });
  } catch (err) { next(err); }
};
