const supabase = require('../config/supabase');

module.exports = async (req, res, next) => {
  const devSecret = req.headers['x-dev-admin-secret'];
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.ADMIN_DEV_SECRET &&
    devSecret === process.env.ADMIN_DEV_SECRET
  ) {
    req.user = { id: 'local-admin', email: process.env.ADMIN_EMAIL || 'admin@faithheroes.local' };
    req.profile = { id: 'local-admin', role: 'admin', full_name: 'Faith Heroes Admin' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();
  req.user = user;
  req.profile = profile;
  next();
};
