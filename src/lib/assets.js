export function assetUrl(url) {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  const base = process.env.PUBLIC_URL || '';
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}
