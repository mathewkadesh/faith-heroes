const dns = require('dns').promises;

let cached = {
  checkedAt: 0,
  reachable: true,
};

async function isSupabaseReachable() {
  const now = Date.now();
  if (now - cached.checkedAt < 30000) return cached.reachable;

  try {
    const hostname = new URL(process.env.SUPABASE_URL).hostname;
    await dns.lookup(hostname);
    cached = { checkedAt: now, reachable: true };
  } catch {
    cached = { checkedAt: now, reachable: false };
  }

  return cached.reachable;
}

module.exports = { isSupabaseReachable };
