// Penyimpanan data RR77 di Upstash Redis (lewat REST, tanpa dependensi).
// Env: APP_PIN (wajib), KV_REST_API_URL + KV_REST_API_TOKEN  atau  UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
const crypto = require('crypto');
const seed = require('./_seed.js');

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const K = 'rr77:data', R = 'rr77:rev';
const MAX = 900000;

// Atomik: tulis hanya bila revisi cocok. Sekaligus simpan titik pulih harian (keadaan sebelum perubahan pertama hari itu).
const LUA = `
local rev = tonumber(redis.call('GET', KEYS[2]) or '0')
if rev ~= tonumber(ARGV[1]) then return {0, rev} end
local old = redis.call('GET', KEYS[1])
if old then redis.call('SET', KEYS[3], old, 'NX', 'EX', 2592000) end
redis.call('SET', KEYS[1], ARGV[2])
redis.call('SET', KEYS[2], rev + 1)
return {1, rev + 1}`;

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'content-type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || 'redis ' + r.status);
  return j.result;
}

const sha = s => crypto.createHash('sha256').update(String(s)).digest();
const pinOk = p => crypto.timingSafeEqual(sha(p), sha(process.env.APP_PIN));

const isDate = s => typeof s === 'string' && /^\d{4}-\d\d-\d\d$/.test(s);
const num = n => typeof n === 'number' && Number.isFinite(n);
function valid(d) {
  if (!d || !Array.isArray(d.outlets) || !d.outlets.length) return false;
  const okO = d.outlets.every(o => o && typeof o.name === 'string' && Array.isArray(o.items) &&
    o.items.every(i => i && isDate(i.date) && num(i.qty) && num(i.price) && typeof i.prod === 'string'));
  if (!okO) return false;
  if (d.pay != null && !(Array.isArray(d.pay) && d.pay.every(p => p && Number.isInteger(p.o) && p.o >= 0 &&
    p.o < d.outlets.length && num(p.amt) && isDate(p.date)))) return false;
  if (d.bahan != null && !Array.isArray(d.bahan)) return false;
  if (d.mov != null && !Array.isArray(d.mov)) return false;
  if (d.rek != null && !Array.isArray(d.rek)) return false;
  if (d.logo != null && !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(d.logo)) return false;
  return true;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const out = (code, obj) => res.status(code).json(obj);
  try {
    if (!process.env.APP_PIN) return out(500, { error: 'APP_PIN belum diatur di Vercel (Settings > Environment Variables).' });
    if (!URL_ || !TOKEN) return out(500, { error: 'Database belum terhubung. Tambahkan Upstash Redis di tab Storage Vercel.' });
    if (req.method !== 'GET' && req.method !== 'PUT') return out(405, { error: 'Metode tidak didukung' });

    // Batasi tebakan PIN: 10 kali gagal per 10 menit per alamat IP
    const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
    const fk = 'rr77:fail:' + crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
    if ((+(await redis(['GET', fk])) || 0) >= 10) return out(429, { error: 'Terlalu banyak percobaan. Coba lagi 10 menit lagi.' });
    const auth = String(req.headers.authorization || '').replace(/^Bearer /, '');
    if (!auth || !pinOk(auth)) {
      if ((await redis(['INCR', fk])) === 1) await redis(['EXPIRE', fk, 600]);
      return out(401, { error: 'PIN salah' });
    }

    if (req.method === 'GET') {
      const [d, rev] = [await redis(['GET', K]), await redis(['GET', R])];
      if (d == null) return out(200, { rev: 0, data: seed });
      return out(200, { rev: +rev || 0, data: JSON.parse(d) });
    }

    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!b || !Number.isInteger(b.rev) || !valid(b.data)) return out(400, { error: 'Data tidak valid' });
    const str = JSON.stringify(b.data);
    if (str.length > MAX) return out(413, { error: 'Data terlalu besar' });
    const day = new Date().toISOString().slice(0, 10);
    const r = await redis(['EVAL', LUA, '3', K, R, 'rr77:bak:' + day, String(b.rev), str]);
    if (r[0] === 1) return out(200, { rev: r[1] });
    const cur = await redis(['GET', K]);
    return out(409, { error: 'Konflik', rev: r[1], data: cur ? JSON.parse(cur) : seed });
  } catch (e) {
    return out(500, { error: 'Kesalahan server: ' + (e && e.message || e) });
  }
};
