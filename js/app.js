/* ═══════════════════════════════════════════════════
   CUERVO STORE — SHARED UTILITIES
   Author: Mr.Candy | Version 1.0
═══════════════════════════════════════════════════ */

// ─── CROW CURSOR ─────────────────────────────────────
class CrowCursor {
  constructor() {
    this.el = document.getElementById('crow-cursor');
    this.ring = document.getElementById('cursor-ring');
    if (!this.el) return;
    this.cx = -100; this.cy = -100;
    this.mx = -100; this.my = -100;
    this.wingUp = false; this.wingTimer = null;
    this.init();
  }
  init() {
    document.addEventListener('mousemove', e => { this.mx = e.clientX; this.my = e.clientY; });
    document.addEventListener('mousedown', () => document.body.classList.add('clicking'));
    document.addEventListener('mouseup',   () => { document.body.classList.remove('clicking'); this.spawnClick(); });
    this.animate();
  }
  animate() {
    this.cx += (this.mx - this.cx) * .15;
    this.cy += (this.my - this.cy) * .15;
    const dx = this.mx - this.cx;
    if (this.el) {
      this.el.style.left = this.cx + 'px';
      this.el.style.top  = this.cy + 'px';
      this.el.style.transform = `translate(-50%,-50%) rotate(${dx * .04}deg)`;
    }
    if (this.ring) { this.ring.style.left = this.mx + 'px'; this.ring.style.top = this.my + 'px'; }
    // Wing flap
    if (!this.wingTimer) {
      this.wingTimer = setTimeout(() => { this.wingUp = !this.wingUp; this.wingTimer = null; }, 100 + Math.random() * 500);
    }
    const wing = this.el && this.el.querySelector('#cw-wing');
    if (wing) wing.setAttribute('ry', this.wingUp ? 7 : 2);
    requestAnimationFrame(() => this.animate());
  }
  spawnClick() {
    if (!this.ring) return;
    const ripple = document.createElement('div');
    ripple.style.cssText = `position:fixed;left:${this.mx}px;top:${this.my}px;width:6px;height:6px;background:#00ff88;border-radius:50%;pointer-events:none;z-index:99990;transform:translate(-50%,-50%);box-shadow:0 0 8px #00ff88;`;
    document.body.appendChild(ripple);
    ripple.animate([{opacity:1,transform:'translate(-50%,-50%) scale(1)'},{opacity:0,transform:'translate(-50%,-50%) scale(4)'}], {duration:500,easing:'ease-out'}).onfinish = () => ripple.remove();
  }
}

// ─── PARTICLE CANVAS ─────────────────────────────────
class ParticleCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    for (let i = 0; i < 80; i++) this.particles.push(new Particle(this.W, this.H));
    this.animate();
  }
  resize() { this.W = this.canvas.width = window.innerWidth; this.H = this.canvas.height = window.innerHeight; }
  animate() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.drawLines();
    this.particles.forEach(p => { p.update(this.W, this.H); p.draw(this.ctx); });
    requestAnimationFrame(() => this.animate());
  }
  drawLines() {
    for (let i = 0; i < this.particles.length; i++)
      for (let j = i+1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(0,255,136,${(1-d/100)*.1})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
  }
}

class Particle {
  constructor(W, H) { this.W = W; this.H = H; this.reset(); }
  reset() {
    this.x = Math.random() * this.W; this.y = Math.random() * this.H;
    this.r = Math.random() * 1.5 + .3; this.vx = (Math.random()-.5)*.4; this.vy = (Math.random()-.5)*.4;
    this.life = Math.random(); this.maxLife = .5 + Math.random() * .5;
  }
  update(W, H) {
    this.x += this.vx; this.y += this.vy; this.life += .003;
    if (this.life > this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw(ctx) {
    const a = Math.sin((this.life/this.maxLife)*Math.PI);
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(0,255,136,${a*.6})`; ctx.shadowBlur = 6; ctx.shadowColor = '#00ff88'; ctx.fill();
  }
}

// ─── TOAST ───────────────────────────────────────────
const Toast = {
  el: null,
  timer: null,
  init() { this.el = document.getElementById('neo-toast'); },
  show(msg, type = 'success', duration = 3000) {
    if (!this.el) { this.init(); }
    if (!this.el) return;
    this.el.textContent = msg;
    this.el.className = 'show' + (type !== 'success' ? ' ' + type : '');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.el.classList.remove('show'), duration);
  },
  success(msg) { this.show('✓ ' + msg, 'success'); },
  error(msg)   { this.show('✗ ' + msg, 'error'); },
  warn(msg)    { this.show('⚠ ' + msg, 'warn'); },
  info(msg)    { this.show('ℹ ' + msg, 'info'); }
};

// ─── LOCAL STORAGE DB ────────────────────────────────
const DB = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem('cs_' + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('cs_' + key, JSON.stringify(val)); return true; } catch { return false; }
  },
  del(key) { localStorage.removeItem('cs_' + key); },
  // Users
  getUsers()      { return this.get('users', []); },
  saveUsers(u)    { this.set('users', u); },
  // Products
  getProducts()   { return this.get('products', []); },
  saveProducts(p) { this.set('products', p); },
  // Orders
  getOrders()     { return this.get('orders', []); },
  saveOrders(o)   { this.set('orders', o); },
  // Cart
  getCart()       { return this.get('cart', []); },
  saveCart(c)     { this.set('cart', c); },
  // Session
  getSession()    { return this.get('session', null); },
  saveSession(s)  { this.set('session', s); },
  clearSession()  { this.del('session'); },
  // Messages / confirmations
  getMessages()   { return this.get('messages', []); },
  saveMessages(m) { this.set('messages', m); },
};

// ─── AUTH ─────────────────────────────────────────────
const Auth = {
  current: null,
  init() { this.current = DB.getSession(); },
  isLoggedIn() { return !!this.current; },
  isAdmin()    { return this.current && this.current.role === 'admin'; },
  isSeller()   { return this.current && (this.current.role === 'seller' || this.current.role === 'admin'); },
  login(email, pass) {
    const users = DB.getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === btoa(pass));
    if (!user) return { ok: false, msg: 'Credenciales inválidas' };
    if (!user.confirmed) return { ok: false, msg: 'Confirma tu cuenta primero. Revisa tu correo.' };
    if (user.banned) return { ok: false, msg: 'Esta cuenta ha sido suspendida.' };
    const session = { ...user, password: undefined };
    DB.saveSession(session);
    this.current = session;
    return { ok: true, user: session };
  },
  logout() { DB.clearSession(); this.current = null; window.location.href = '/index.html'; },
  register(data) {
    const users = DB.getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase()))
      return { ok: false, msg: 'Este correo ya está registrado.' };
    const token = Math.random().toString(36).slice(2, 10).toUpperCase();
    const user = {
      id:        'u_' + Date.now(),
      name:      data.name,
      email:     data.email,
      phone:     data.phone || '',
      password:  btoa(data.password),
      role:      'buyer',
      avatar:    data.avatar || 'assets/avatars/default.svg',
      career:    data.career || '',
      confirmed: false,
      confirmToken: token,
      banned:    false,
      createdAt: new Date().toISOString(),
      sellerRequested: false,
    };
    users.push(user);
    DB.saveUsers(users);
    // Simulate email sending (store message)
    const msgs = DB.getMessages();
    msgs.push({ type: 'email', to: data.email, subject: 'Confirma tu cuenta — Cuervo Store', body: `Tu código de confirmación es: ${token}`, token, userId: user.id, read: false, createdAt: new Date().toISOString() });
    DB.saveMessages(msgs);
    return { ok: true, token, msg: 'Cuenta creada. Revisa tu correo para confirmar.' };
  },
  confirmAccount(token) {
    const users = DB.getUsers();
    const idx = users.findIndex(u => u.confirmToken === token);
    if (idx === -1) return { ok: false, msg: 'Código inválido o expirado.' };
    users[idx].confirmed = true;
    users[idx].confirmToken = null;
    DB.saveUsers(users);
    return { ok: true, msg: 'Cuenta confirmada. ¡Ya puedes iniciar sesión!' };
  },
  updateProfile(data) {
    const users = DB.getUsers();
    const idx = users.findIndex(u => u.id === this.current.id);
    if (idx === -1) return { ok: false };
    Object.assign(users[idx], data);
    DB.saveUsers(users);
    const session = { ...users[idx], password: undefined };
    DB.saveSession(session);
    this.current = session;
    return { ok: true };
  },
  requireAuth(redirect = 'pages/login.html') {
    if (!this.isLoggedIn()) { window.location.href = redirect; return false; }
    return true;
  },
  requireAdmin() {
    if (!this.isAdmin()) { window.location.href = '/index.html'; return false; }
    return true;
  }
};

// ─── PRODUCTS ────────────────────────────────────────
const Products = {
  getAll()        { return DB.getProducts(); },
  getById(id)     { return DB.getProducts().find(p => p.id === id) || null; },
  getBySeller(id) { return DB.getProducts().filter(p => p.sellerId === id); },
  getApproved()   { return DB.getProducts().filter(p => p.status === 'approved'); },
  search(q, cat)  {
    let list = this.getApproved();
    if (q)   list = list.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || p.desc.toLowerCase().includes(q.toLowerCase()));
    if (cat) list = list.filter(p => p.category === cat);
    return list;
  },
  add(data) {
    const products = DB.getProducts();
    const product = {
      id:        'p_' + Date.now(),
      sellerId:  data.sellerId,
      sellerName:data.sellerName,
      title:     data.title,
      desc:      data.desc,
      price:     parseFloat(data.price),
      stock:     parseInt(data.stock) || 1,
      category:  data.category,
      images:    data.images || [],
      status:    'pending',
      rating:    0,
      reviews:   [],
      sold:      0,
      createdAt: new Date().toISOString(),
    };
    products.push(product);
    DB.saveProducts(products);
    return { ok: true, product };
  },
  update(id, data) {
    const products = DB.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return { ok: false };
    Object.assign(products[idx], data);
    DB.saveProducts(products);
    return { ok: true, product: products[idx] };
  },
  delete(id) {
    let products = DB.getProducts();
    products = products.filter(p => p.id !== id);
    DB.saveProducts(products);
    return { ok: true };
  },
  addReview(id, review) {
    const products = DB.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return { ok: false };
    products[idx].reviews = products[idx].reviews || [];
    products[idx].reviews.push({ ...review, id: 'r_' + Date.now(), createdAt: new Date().toISOString() });
    const total = products[idx].reviews.reduce((s, r) => s + r.stars, 0);
    products[idx].rating = (total / products[idx].reviews.length).toFixed(1);
    DB.saveProducts(products);
    return { ok: true };
  }
};

// ─── CART ────────────────────────────────────────────
const Cart = {
  items: [],
  init()        { this.items = DB.getCart(); this.updateBadge(); },
  add(product, qty = 1) {
    const idx = this.items.findIndex(i => i.productId === product.id);
    if (idx > -1) this.items[idx].qty += qty;
    else this.items.push({ productId: product.id, title: product.title, price: product.price, image: product.images[0] || '', qty });
    this.save();
  },
  remove(productId) { this.items = this.items.filter(i => i.productId !== productId); this.save(); },
  updateQty(productId, qty) {
    const idx = this.items.findIndex(i => i.productId === productId);
    if (idx > -1) { if (qty <= 0) this.remove(productId); else this.items[idx].qty = qty; }
    this.save();
  },
  total()  { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count()  { return this.items.reduce((s, i) => s + i.qty, 0); },
  clear()  { this.items = []; this.save(); },
  save()   { DB.saveCart(this.items); this.updateBadge(); },
  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => { b.textContent = this.count(); b.style.display = this.count() > 0 ? 'inline' : 'none'; });
  }
};

// ─── ORDERS ──────────────────────────────────────────
const Orders = {
  getAll()        { return DB.getOrders(); },
  getById(id)     { return DB.getOrders().find(o => o.id === id) || null; },
  getByUser(uid)  { return DB.getOrders().filter(o => o.buyerId === uid); },
  create(buyerId, items, payment, total, address) {
    const orders = DB.getOrders();
    const order = {
      id:        'ord_' + Date.now(),
      buyerId,
      items,
      total,
      address,
      payment:   { ...payment, cardNumber: '****' + payment.cardNumber.slice(-4) },
      status:    'pagado',
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    // Update sold count
    const products = DB.getProducts();
    items.forEach(item => {
      const idx = products.findIndex(p => p.id === item.productId);
      if (idx > -1) { products[idx].sold += item.qty; products[idx].stock -= item.qty; }
    });
    DB.saveProducts(products);
    DB.saveOrders(orders);
    return { ok: true, order };
  },
  updateStatus(id, status) {
    const orders = DB.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return { ok: false };
    orders[idx].status = status;
    DB.saveOrders(orders);
    return { ok: true };
  }
};

// ─── GLITCH TEXT ─────────────────────────────────────
function glitchText(el, original) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%&';
  let i = 0;
  const iv = setInterval(() => {
    el.textContent = original.split('').map((c, j) => {
      if (j < i) return original[j];
      if (c === ' ') return ' ';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    i += 0.4;
    if (i >= original.length) { el.textContent = original; clearInterval(iv); }
  }, 40);
}

// ─── FORMAT PRICE ────────────────────────────────────
function formatPrice(n) { return '$' + parseFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

// ─── STAR RATING ─────────────────────────────────────
function renderStars(n) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += `<span class="${i <= n ? 'active' : ''}">★</span>`;
  return `<div class="stars">${s}</div>`;
}

// ─── SHARED HEADER NAV (injected dynamically) ─────────
function renderNav(activePage = '') {
  Auth.init();
  const sess = Auth.current;
  const navEl = document.getElementById('main-nav');
  if (!navEl) return;
  navEl.innerHTML = `
    <nav class="cs-nav">
      <a href="/index.html" class="cs-nav-brand">
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
          <ellipse cx="30" cy="38" rx="14" ry="10" fill="#00ff88"/>
          <polygon points="16,38 6,48 14,37 6,35" fill="#00ff88"/>
          <circle cx="44" cy="26" r="10" fill="#00ff88"/>
          <circle cx="46" cy="24" r="3" fill="#030d0a"/>
          <polygon points="53,25 62,21 54,30" fill="#00cc6a"/>
        </svg>
        <span>CUERVO<span class="brand-accent">STORE</span></span>
      </a>
      <div class="cs-nav-links">
        <a href="/index.html" class="${activePage==='home'?'active':''}">INICIO</a>
        <a href="/pages/catalog.html" class="${activePage==='catalog'?'active':''}">CATÁLOGO</a>
        ${sess ? `<a href="/pages/sell.html" class="${activePage==='sell'?'active':''}">VENDER</a>` : ''}
        ${Auth.isAdmin() ? `<a href="/pages/admin/dashboard.html" class="admin-link ${activePage==='admin'?'active':''}">⬡ ADMIN</a>` : ''}
      </div>
      <div class="cs-nav-actions">
        <a href="/pages/cart.html" class="nav-icon-btn" title="Carrito">
          🛒 <span class="cart-badge" style="display:none">0</span>
        </a>
        ${sess ? `
          <a href="/pages/profile.html" class="nav-avatar">
            <div class="avatar-wrap" style="width:34px;height:34px;">
              <img src="/${sess.avatar}" onerror="this.src='/assets/avatars/default.svg'"/>
            </div>
          </a>
          <button class="neo-btn" style="padding:8px 16px;font-size:.6rem;" onclick="Auth.logout()"><span>SALIR</span></button>
        ` : `
          <a href="/pages/login.html" class="neo-btn" style="padding:8px 16px;font-size:.6rem;"><span>ENTRAR</span></a>
          <a href="/pages/register.html" class="neo-btn" style="padding:8px 20px;font-size:.6rem;border-color:var(--green-dark);"><span>REGISTRO</span></a>
        `}
      </div>
      <button class="nav-hamburger" onclick="toggleMobileNav()">☰</button>
    </nav>
  `;
  Cart.init();
}

function toggleMobileNav() { document.querySelector('.cs-nav')?.classList.toggle('mobile-open'); }

// ─── SEED DEMO DATA ──────────────────────────────────
function seedDemoData() {
  if (DB.get('seeded')) return;
  // Admin user
  const users = [
    { id:'u_admin', name:'Mr.Candy', email:'admin@cuervostore.mx', password: btoa('admin123'), role:'admin', avatar:'assets/avatars/tics.svg', career:'TICS', confirmed:true, banned:false, createdAt: new Date().toISOString() },
    { id:'u_demo1', name:'Ana Ramírez', email:'ana@demo.com', password: btoa('demo123'), role:'seller', avatar:'assets/avatars/enfermeria.svg', career:'Enfermería', confirmed:true, banned:false, createdAt: new Date().toISOString(), sellerRequested:true },
    { id:'u_demo2', name:'Carlos Mejía', email:'carlos@demo.com', password: btoa('demo123'), role:'buyer', avatar:'assets/avatars/mecanica.svg', career:'Mecatrónica', confirmed:true, banned:false, createdAt: new Date().toISOString() },
  ];
  DB.saveUsers(users);

  const products = [
    { id:'p1', sellerId:'u_demo1', sellerName:'Ana Ramírez', title:'Kit de Enfermería Premium', desc:'Kit completo con estetoscopio, tensiómetro y termómetro digital. Ideal para estudiantes y profesionales.', price:850, stock:15, category:'salud', images:[], status:'approved', rating:4.8, reviews:[], sold:23, createdAt: new Date().toISOString() },
    { id:'p2', sellerId:'u_admin', sellerName:'Mr.Candy', title:'Arduino Mega 2560 + Sensores', desc:'Paquete completo para proyectos de mecatrónica e ingeniería. Incluye 40 sensores y módulos.', price:1200, stock:8, category:'electronica', images:[], status:'approved', rating:4.9, reviews:[], sold:41, createdAt: new Date().toISOString() },
    { id:'p3', sellerId:'u_demo1', sellerName:'Ana Ramírez', title:'Manual de Primeros Auxilios', desc:'Manual actualizado 2024 con técnicas RCP, manejo de trauma y emergencias médicas.', price:320, stock:30, category:'libros', images:[], status:'approved', rating:4.6, reviews:[], sold:67, createdAt: new Date().toISOString() },
    { id:'p4', sellerId:'u_admin', sellerName:'Mr.Candy', title:'Laptop Gaming Gamer Pro X', desc:'15.6" FHD 144Hz, RTX 4060, Intel i7-13th, 16GB RAM, 512GB NVMe. Para ingenieros y gamers.', price:22999, stock:5, category:'electronica', images:[], status:'approved', rating:4.7, reviews:[], sold:12, createdAt: new Date().toISOString() },
    { id:'p5', sellerId:'u_demo1', sellerName:'Ana Ramírez', title:'Uniforme Médico Scrubs', desc:'Set de 2 piezas en tela antimicrobiana. Disponible en azul, verde y blanco. Tallas S-XL.', price:480, stock:20, category:'ropa', images:[], status:'approved', rating:4.5, reviews:[], sold:38, createdAt: new Date().toISOString() },
    { id:'p6', sellerId:'u_admin', sellerName:'Mr.Candy', title:'Casco Ferroviario Certificado', desc:'Casco de seguridad certificado EN397 para ingeniería ferroviaria. Con porta-linterna integrado.', price:650, stock:12, category:'seguridad', images:[], status:'approved', rating:4.3, reviews:[], sold:9, createdAt: new Date().toISOString() },
  ];
  DB.saveProducts(products);
  DB.set('seeded', true);
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  Cart.init();
  seedDemoData();
  new CrowCursor();
  new ParticleCanvas('bg-canvas');
  Toast.init();
  const brand = document.querySelector('.brand-name');
  if (brand) { setTimeout(() => glitchText(brand, brand.textContent), 600); setInterval(() => glitchText(brand, brand.textContent), 8000); }
});
