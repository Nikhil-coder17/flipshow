/*  Maverick Fashion - store server
    No npm packages needed. Run with:  node server.js          */
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path'), crypto = require('crypto');

/* ---------- settings (from .env file or hosting dashboard) ---------- */
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch (e) { /* no .env file, that's fine */ }

const PORT = +process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';
const RZP_KEY = process.env.RAZORPAY_KEY_ID || '', RZP_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const PUB = path.join(__dirname, 'public');
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOADS = process.env.UPLOAD_DIR || path.join(PUB, 'uploads');

/* ---------- first-run setup: copy starter data if the folders are empty ---------- */
fs.mkdirSync(DATA, { recursive: true }); fs.mkdirSync(UPLOADS, { recursive: true });
for (const f of ['products.json', 'orders.json']) {
  const dst = path.join(DATA, f), src = path.join(__dirname, 'data', f);
  if (!fs.existsSync(dst)) { if (fs.existsSync(src)) fs.copyFileSync(src, dst); else fs.writeFileSync(dst, '[]'); }
}
const defUp = path.join(PUB, 'uploads');
if (path.resolve(UPLOADS) !== path.resolve(defUp) && fs.existsSync(defUp) && !fs.readdirSync(UPLOADS).length)
  fs.readdirSync(defUp).forEach(f => fs.copyFileSync(path.join(defUp, f), path.join(UPLOADS, f)));

/* ---------- tiny JSON "database" ---------- */
const file = n => path.join(DATA, n + '.json');
const load = n => JSON.parse(fs.readFileSync(file(n), 'utf8') || '[]');
const save = (n, v) => { const t = file(n) + '.tmp'; fs.writeFileSync(t, JSON.stringify(v, null, 1)); fs.renameSync(t, file(n)); };
const clean = (v, max = 200) => String(v == null ? '' : v).replace(/[<>"]/g, '').trim().slice(0, max);

/* ---------- helpers ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const body = (req, limit = 8e6) => new Promise((ok, no) => {
  let b = '', n = 0;
  req.on('data', c => { n += c.length; if (n > limit) { no(new Error('Too large')); req.destroy(); } else b += c; });
  req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { no(new Error('Bad request')); } });
});
const tokens = new Map(); // admin sessions (cleared when the server restarts)
const isAdmin = req => { const t = (req.headers.authorization || '').replace('Bearer ', ''); const e = tokens.get(t); return !!e && e > Date.now(); };
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

function rzpCreate(amountPaise, receipt) {
  return new Promise((ok, no) => {
    const data = JSON.stringify({ amount: amountPaise, currency: 'INR', receipt });
    const r = https.request({ hostname: 'api.razorpay.com', path: '/v1/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), Authorization: 'Basic ' + Buffer.from(RZP_KEY + ':' + RZP_SECRET).toString('base64') } },
      res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { const j = JSON.parse(b); j.id ? ok(j) : no(new Error('Payment gateway error')); } catch (e) { no(e); } }); });
    r.on('error', no); r.write(data); r.end();
  });
}

/* ---------- API ---------- */
async function api(req, res, url) {
  const p = url.pathname, m = req.method;

  // ---- public ----
  if (p === '/api/products' && m === 'GET') return send(res, 200, load('products').filter(x => x.active !== false));

  if (p === '/api/orders' && m === 'POST') {
    const b = await body(req), products = load('products');
    const c = b.customer || {};
    const customer = { name: clean(c.name, 80), phone: clean(c.phone, 15), pincode: clean(c.pincode, 10), address: clean(c.address, 250), city: clean(c.city, 60), email: clean(c.email, 80) };
    if (customer.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(customer.email)) return send(res, 400, { error: 'Please enter a valid email address.' });
    if (!customer.name || !/^\d{10}$/.test(customer.phone) || !/^\d{6}$/.test(customer.pincode) || !customer.address || !customer.city) return send(res, 400, { error: 'Please fill every field correctly.' });
    if (!Array.isArray(b.items) || !b.items.length || b.items.length > 50) return send(res, 400, { error: 'Your cart is empty.' });
    const items = []; let total = 0;
    for (const it of b.items) {                      // prices always come from OUR database, never from the browser
      const pr = products.find(x => x.id === +it.id && x.active !== false), qty = Math.max(1, Math.min(50, +it.qty | 0));
      if (!pr) return send(res, 400, { error: 'A product in your cart is no longer available.' });
      items.push({ id: pr.id, name: pr.n, variant: pr.v, price: pr.p, qty, size: clean(it.size, 5) }); total += pr.p * qty;
    }
    const payment = 'Razorpay';   // online payment through Razorpay only
    const orders = load('orders');
    let id; do { id = 'MAV' + (100000 + crypto.randomInt(900000)); } while (orders.some(o => o.id === id));
    const order = { id, createdAt: new Date().toISOString(), customer, items, total, payment, status: 'New', paid: false };
    let out = { orderId: id, total };
    if (RZP_KEY && RZP_SECRET) {
      try { const r = await rzpCreate(total * 100, id); order.rzpOrderId = r.id; out.razorpay = { key: RZP_KEY, orderId: r.id, amount: total * 100 }; }
      catch (e) { return send(res, 502, { error: 'Online payment is not available right now. Please try again in a few minutes.' }); }
    } else out.message = 'Online payment is not switched on yet. We will contact you on ' + customer.phone + ' to complete the payment.';
    orders.push(order); save('orders', orders);
    return send(res, 200, out);
  }

  if (p === '/api/orders/track' && m === 'POST') {
    const b = await body(req);
    const o = load('orders').find(x => x.id === String(b.orderId || '') && x.customer && x.customer.phone === String(b.phone || ''));
    if (!o) return send(res, 404, { error: 'Order not found' });
    return send(res, 200, { id: o.id, status: o.status, paid: !!o.paid, total: o.total, createdAt: o.createdAt });
  }

  if (p === '/api/orders/verify' && m === 'POST') {
    const b = await body(req), orders = load('orders'), o = orders.find(x => x.id === b.orderId);
    if (!o || !o.rzpOrderId) return send(res, 400, { error: 'Order not found.' });
    const sig = crypto.createHmac('sha256', RZP_SECRET).update(o.rzpOrderId + '|' + b.razorpay_payment_id).digest('hex');
    if (!same(sig, b.razorpay_signature)) return send(res, 400, { error: 'Payment could not be verified.' });
    o.paid = true; o.status = 'Confirmed'; o.paymentId = clean(b.razorpay_payment_id, 60); save('orders', orders);
    return send(res, 200, { ok: true });
  }

  // ---- admin ----
  if (p === '/api/admin/login' && m === 'POST') {
    const b = await body(req);
    if (!same(b.password || '', ADMIN_PASSWORD)) { await new Promise(r => setTimeout(r, 700)); return send(res, 401, { error: 'Wrong password' }); }
    const t = crypto.randomBytes(24).toString('hex'); tokens.set(t, Date.now() + 12 * 3600e3);
    return send(res, 200, { token: t, defaultPassword: ADMIN_PASSWORD === 'change-me' });
  }
  if (!p.startsWith('/api/admin/')) return send(res, 404, { error: 'Not found' });
  if (!isAdmin(req)) return send(res, 401, { error: 'Please log in' });

  if (p === '/api/admin/products' && m === 'GET') return send(res, 200, load('products'));

  if (p === '/api/admin/products' && m === 'POST') {
    const b = await body(req), ps = load('products');
    const prod = fromForm(b, { id: ps.reduce((a, x) => Math.max(a, x.id), 0) + 1 });
    if (typeof prod === 'string') return send(res, 400, { error: prod });
    ps.push(prod); save('products', ps); return send(res, 200, prod);
  }
  let mm = p.match(/^\/api\/admin\/products\/(\d+)$/);
  if (mm && m === 'PUT') {
    const b = await body(req), ps = load('products'), i = ps.findIndex(x => x.id === +mm[1]);
    if (i < 0) return send(res, 404, { error: 'Not found' });
    const prod = fromForm(b, ps[i]); if (typeof prod === 'string') return send(res, 400, { error: prod });
    ps[i] = prod; save('products', ps); return send(res, 200, prod);
  }
  if (mm && m === 'DELETE') { save('products', load('products').filter(x => x.id !== +mm[1])); return send(res, 200, { ok: true }); }

  if (p === '/api/admin/upload' && m === 'POST') {
    const b = await body(req, 9e6), r = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(b.dataUrl || '');
    if (!r) return send(res, 400, { error: 'Please choose a JPG, PNG or WEBP photo.' });
    const buf = Buffer.from(r[2], 'base64'); if (buf.length > 6e6) return send(res, 400, { error: 'Photo is too big.' });
    const name = 'u' + Date.now() + crypto.randomBytes(3).toString('hex') + '.' + (r[1] === 'png' ? 'png' : r[1] === 'webp' ? 'webp' : 'jpg');
    fs.writeFileSync(path.join(UPLOADS, name), buf); return send(res, 200, { url: '/uploads/' + name });
  }

  if (p === '/api/admin/orders' && m === 'GET') return send(res, 200, load('orders').reverse());
  mm = p.match(/^\/api\/admin\/orders\/(MAV\d+)$/);
  if (mm && m === 'PUT') {
    const b = await body(req), os = load('orders'), o = os.find(x => x.id === mm[1]);
    if (!o) return send(res, 404, { error: 'Not found' });
    if (['New', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(b.status)) o.status = b.status;
    if (typeof b.paid === 'boolean') o.paid = b.paid;
    save('orders', os); return send(res, 200, o);
  }
  return send(res, 404, { error: 'Not found' });
}

function fromForm(b, base) {
  const n = clean(b.n, 80), c = clean(b.c, 40), price = Math.round(+b.p);
  if (!n || !c) return 'Name and category are required.';
  if (!(price > 0 && price < 1e6)) return 'Enter a valid price.';
  const img = clean(b.img, 300); if (!/^\/uploads\/[\w.-]+$/.test(img)) return 'Please upload a product photo.';
  return { ...base, n, v: clean(b.v, 80), c, p: price, bg: /^#[0-9a-f]{3,8}$/i.test(b.bg || '') ? b.bg : '#222222', img, d: clean(b.d, 400), active: b.active !== false };
}

/* ---------- web server ---------- */
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let rel = decodeURIComponent(url.pathname); if (rel === '/') rel = '/index.html';
    const root = rel.startsWith('/uploads/') ? UPLOADS : PUB, sub = rel.startsWith('/uploads/') ? rel.slice(9) : rel;
    const fp = path.normalize(path.join(root, sub));
    if (!fp.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    fs.readFile(fp, (e, d) => {
      if (e) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Page not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream', 'Cache-Control': rel.startsWith('/uploads/') ? 'public, max-age=604800' : 'no-cache' });
      res.end(d);
    });
  } catch (e) { if (!res.headersSent) send(res, e.message === 'Too large' ? 413 : 400, { error: e.message }); }
}).listen(PORT, () => {
  console.log('\n  Maverick Fashion store is running');
  console.log('  Website : http://localhost:' + PORT);
  console.log('  Admin   : http://localhost:' + PORT + '/admin.html');
  if (ADMIN_PASSWORD === 'change-me') console.log('\n  WARNING: change ADMIN_PASSWORD in your .env file before going live!');
  console.log(RZP_KEY ? '  Online payments: ON (Razorpay)\n' : '  Online payments: OFF (orders are saved as payment pending)\n');
});
