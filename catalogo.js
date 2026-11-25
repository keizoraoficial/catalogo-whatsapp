
'use strict';

const $ = id => document.getElementById(id);
const money = amount => 'S/ ' + amount.toFixed(2);
const wellFormed = text => text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g,
  match => match.length === 2 ? match : '\uFFFD');
const clean = value => typeof value === 'string' ? wellFormed(value.trim()) : '';
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const color = value => /^#[a-f\d]{6}$/i.test(clean(value)) ? clean(value) : '';
const amount = value => {
  if (typeof value !== 'number' && !clean(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= Number.MAX_SAFE_INTEGER / 100 ? number : null;
};

function imageUrl(value) {
  const path = clean(value);
  if (!path || /[\\\u0000-\u001f\u007f]/.test(path) || path.startsWith('//')) return '';
  try {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path);
      return url.username || url.password ? '' : url.href;
    }
    const relative = path.replace(/^\//, '');
    if (!relative || /^[a-z][a-z\d+.-]*:/i.test(relative)) return '';
    const base = new URL('./', document.baseURI);
    const url = new URL(relative, base);
    return url.origin === base.origin && url.pathname.startsWith(base.pathname) ? url.href : '';
  } catch {
    return '';
  }
}

function normalizeBiz(raw) {
  const phone = clean(raw.whatsapp) || (Number.isSafeInteger(raw.whatsapp) ? String(raw.whatsapp) : '');
  return {
    name: clean(raw.nombre) || 'Catálogo',
    slogan: clean(raw.eslogan),
    title: clean(raw.titulo_portada),
    phone: /^51\d{9}$/.test(phone) ? phone : '',
    del: amount(raw.costo_delivery) ?? 0,
    hours: clean(raw.horario),
    addr: clean(raw.direccion),
    payments: Array.isArray(raw.metodos_pago) ? raw.metodos_pago.map(clean).filter(Boolean) : [],
    logo: imageUrl(raw.logo),
    cover: imageUrl(raw.portada),
    primary: color(raw.colores?.primario),
    accent: color(raw.colores?.acento)
  };
}

function normalizeProduct(raw, index) {
  const price = amount(raw.precio_desde);
  const sizes = Array.isArray(raw.tamanos) ? raw.tamanos.filter(isRecord)
    .map(size => [clean(size.nombre) || 'Unidad', amount(size.precio)])
    .filter(size => size[1] !== null) : [];
  if (!sizes.length && price !== null) sizes.push(['Unidad', price]);
  return {
    id: index + 1,
    n: clean(raw.nombre) || 'Producto sin nombre',
    c: clean(raw.categoria) || 'Sin categoría',
    d: clean(raw.descripcion),
    s: sizes,
    price: price ?? (sizes.length ? Math.min(...sizes.map(size => size[1])) : null),
    foto: imageUrl(raw.foto),
    out: raw.agotado === true || clean(raw.agotado).toLowerCase() === 'true',
    featured: raw.destacado === true
  };
}

let S = {biz: normalizeBiz({}), products: []};
const cart = [];
let filter = 0;
let categories = [];
let mode = 'Delivery';

function renderBiz() {
  const b = S.biz;
  const values = {
    bizName: b.name, fName: b.name, heroTitle: b.title || b.name, slogan: b.slogan,
    fHours: b.hours, fAddr: b.addr, fPhone: b.phone ? '+' + b.phone.replace(/^(..)(...)(...)(...)$/, '$1 $2 $3 $4') : '',
    heroPay: b.payments.join(', ')
  };
  for (const [id, value] of Object.entries(values)) $(id).textContent = value;
  for (const id of ['fHours', 'fAddr', 'fPhone']) $(id).parentElement.hidden = !values[id];
  $('heroPayBlock').hidden = !b.payments.length;
  document.title = b.name;
  if (b.primary) document.documentElement.style.setProperty('--choc', b.primary);
  if (b.accent) document.documentElement.style.setProperty('--acc', b.accent);

  const initials = b.name.split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join('').toUpperCase();
  for (const id of ['navLogo', 'heroLogo']) {
    const mark = $(id);
    mark.textContent = initials;
    if (!b.logo) continue;
    const image = document.createElement('img');
    image.alt = '';
    if (id === 'heroLogo') {
      image.addEventListener('load', () => { $('heroArt').style.visibility = 'hidden'; }, {once: true});
    }
    image.addEventListener('error', () => { mark.textContent = initials; }, {once: true});
    mark.replaceChildren(image);
    image.src = b.logo;
  }

  if (b.cover) {
    const cover = $('cover');
    cover.addEventListener('load', () => $('inicio').classList.add('photo'), {once: true});
    cover.src = b.cover;
  }
}

function renderChips() {
  $('chips').innerHTML = ['Todos', ...categories].map((category, index) =>
    '<button class="chip" aria-pressed="' + (index === filter) + '" data-f="' + index + '">' + esc(category) + '</button>'
  ).join('');
}

function renderGrid() {
  const products = S.products.filter(p => !filter || p.c === categories[filter - 1]);
  $('grid').innerHTML = products.length ? products.map(p => {
    const label = p.out ? 'Agotado' : p.featured ? 'Destacado · ' + p.c : p.c;
    const options = p.s.map(([name, price], index) =>
      '<option value="' + index + '">' + esc(name) + ' · ' + money(price) + '</option>'
    ).join('');
    return `<article class="card ${p.out ? 'out' : ''}"><div class="pic">${pic(p)}<span class="tag">${esc(label)}</span></div><div class="body"><h3>${esc(p.n)}</h3><p>${esc(p.d)}</p>
    ${options ? `<div class="row"><select id="sz${p.id}" aria-label="Tamaño de ${esc(p.n)}">${options}</select></div>` : ''}
    <div class="row"><span class="price">${p.price === null ? 'Precio no disponible' : 'desde ' + money(p.price)}</span><button class="add" data-add="${p.id}" style="margin-left:auto" ${p.out || !p.s.length ? 'disabled' : ''}>${p.out ? 'Agotado' : 'Agregar'}</button></div></div></article>`;
  }).join('') : '<p class="empty">Aún no hay productos en esta categoría.</p>';
}

async function readData(file, validShape) {
  try {
    const response = await fetch('data/' + file, {cache: 'no-cache'});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if (!validShape(data)) throw new Error('Formato inesperado');
    return data;
  } catch (cause) {
    throw new Error('No se pudo cargar data/' + file + '. Comprueba que el archivo exista y sea un JSON válido.', {cause});
  }
}

async function loadCatalog() {
  try {
    const [biz, products] = await Promise.all([
      readData('negocio.json', isRecord),
      readData('productos.json', Array.isArray)
    ]);
    S = {biz: normalizeBiz(biz), products: products.filter(isRecord).map(normalizeProduct)};
    categories = [...new Set(S.products.map(product => product.c))];
    renderBiz();
    renderChips();
    renderGrid();
    renderCart();
    $('catalogStatus').hidden = true;
  } catch (error) {
    $('catalogStatus').textContent = error.cause ? error.message : 'No se pudo mostrar el catálogo. Recarga la página e inténtalo de nuevo.';
    console.error(error);
  }
}
const ILL={
 Tortas:(a,b,c)=>`<svg viewBox="0 0 200 160"><ellipse cx="100" cy="146" rx="80" ry="9" fill="#3a1d14" opacity=".13"/><ellipse cx="100" cy="138" rx="80" ry="10" fill="#fff"/><rect x="38" y="70" width="124" height="68" rx="10" fill="${a}"/><rect x="38" y="100" width="124" height="7" fill="${b}" opacity=".9"/><path d="M38 80q0-14 14-14h96q14 0 14 14v6q-6 10-12 0q-6 14-14 2q-7 12-14 0q-7 16-15 1q-7 12-14 0q-7 14-15 1q-6 10-12-2q-6 10-14-2q-6 10-14 -6z" fill="${b}"/><rect x="136" y="70" width="26" height="68" rx="10" fill="#000" opacity=".1"/><g fill="${c}"><circle cx="72" cy="60" r="9"/><circle cx="100" cy="56" r="9"/><circle cx="128" cy="60" r="9"/></g><g fill="#fff" opacity=".6"><circle cx="69" cy="57" r="2.5"/><circle cx="97" cy="53" r="2.5"/><circle cx="125" cy="57" r="2.5"/></g></svg>`,
 Bocaditos:(a,b,c)=>`<svg viewBox="0 0 200 160"><ellipse cx="100" cy="148" rx="50" ry="7" fill="#3a1d14" opacity=".13"/><path d="M62 92h76l-10 54H72z" fill="${a}"/><path d="M75 92l4 54M91 92l2 54M109 92l-2 54M125 92l-4 54" stroke="#000" stroke-opacity=".12" stroke-width="3"/><ellipse cx="100" cy="90" rx="46" ry="16" fill="${b}"/><ellipse cx="100" cy="74" rx="36" ry="14" fill="${b}"/><ellipse cx="100" cy="60" rx="24" ry="11" fill="${b}"/><path d="M70 88q30 10 60 0" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/><circle cx="100" cy="44" r="10" fill="${c}"/><circle cx="96" cy="40" r="3" fill="#fff" opacity=".6"/><path d="M100 34q4-12 14-16" stroke="#3c8a4e" stroke-width="3" fill="none"/></svg>`,
 Postres:(a,b,c)=>`<svg viewBox="0 0 200 160"><ellipse cx="100" cy="140" rx="80" ry="12" fill="#fff"/><ellipse cx="100" cy="146" rx="78" ry="8" fill="#3a1d14" opacity=".1"/><path d="M40 112l120-30v38l-120 18z" fill="${a}"/><path d="M40 112l120-30l-30-26z" fill="${b}"/><path d="M40 112v26l-0-26z" fill="${a}"/><path d="M40 130l120-16v6l-120 18z" fill="#c99a5b"/><path d="M130 56l30 26v38l-30-24z" fill="#000" opacity=".08"/><circle cx="110" cy="70" r="8" fill="${c}"/><circle cx="90" cy="80" r="6" fill="${c}"/></svg>`,
};

const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const pic = p => (Object.prototype.hasOwnProperty.call(ILL, p.c) ? ILL[p.c] : ILL.Tortas)('#f6b8c6', '#fff', '#d6284e') + (p.foto ? `<img class="ph" src="${esc(p.foto)}" alt="${esc(p.n)}" loading="lazy">` : '');

function toast(t){const el=$('toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),2200)}

function renderCart(){const n=cart.reduce((a,i)=>a+i.q,0);$('count').textContent=n;
 const sub=cart.reduce((a,i)=>a+i.p*i.q,0),del=cart.length&&mode==='Delivery'?Number(S.biz.del)||0:0;
 $('sSub').textContent=money(sub);$('sDel').textContent=money(del);$('sTot').textContent=money(sub+del);
 const prev={};['cNote','cDate','cName','cAddr','cPay'].forEach(k=>{const e=$(k);if(e)prev[k]=e.value});
 const now = new Date();
 const today = [now.getFullYear(), now.getMonth()+1, now.getDate()].map(n=>String(n).padStart(2,'0')).join('-');
 $('cartBody').innerHTML=cart.length?cart.map((i,k)=>`<div class="item"><div class="mini">${pic(S.products.find(p=>p.id===i.id)||{})}</div><div><strong>${esc(i.n)}</strong><small>${esc(i.s)} · ${money(i.p)}</small></div><div class="qty"><button data-q="${k}" data-d="-1" aria-label="Quitar uno">−</button><span>${i.q}</span><button data-q="${k}" data-d="1" aria-label="Agregar uno">+</button></div></div>`).join('')+`
 <label>Nota (opcional)<input id="cNote" placeholder="Añade un detalle para tu pedido"></label>
 <label>Fecha de entrega<input id="cDate" type="date" min="${today}"></label>
 <div class="seg" role="group" aria-label="Entrega">${['Delivery','Recojo en tienda'].map(m=>`<button data-m="${m}" aria-pressed="${m===mode}">${m}</button>`).join('')}</div>
 <div class="two"><label>Tu nombre<input id="cName" autocomplete="name"></label>${S.biz.payments.length ? `<label>Pago<select id="cPay">${S.biz.payments.map(pay=>`<option>${esc(pay)}</option>`).join('')}</select></label>` : ''}</div>
 ${mode==='Delivery'?'<label>Dirección de entrega<input id="cAddr" autocomplete="street-address" placeholder="Calle, número, distrito"></label>':''}`:'<div class="empty"><p>Tu pedido está vacío.</p><p>Agrega productos del catálogo.</p></div>';
 Object.entries(prev).forEach(([k,v])=>{const e=$(k);if(e)e.value=v});updateWA()}

function updateWA(){const btn=$('waBtn'),name=$('cName')?.value.trim(),date=$('cDate')?.value,addr=$('cAddr')?.value.trim();
 const validDate = date && $('cDate').validity.valid;
 const ok=S.biz.phone&&cart.length&&name&&validDate&&(mode!=='Delivery'||addr);
 btn.setAttribute('aria-disabled',ok?'false':'true');$('waHint').textContent=!cart.length?'Agrega productos para hacer tu pedido.':!S.biz.phone?'El negocio aún no ha configurado un número de WhatsApp válido.':ok?'Se abrirá WhatsApp con tu pedido listo para enviar.':'Completa tu nombre, la fecha'+(mode==='Delivery'?' y la dirección':'')+' para enviar.';
 if(!ok){btn.removeAttribute('href');return}
 const sub=cart.reduce((a,i)=>a+i.p*i.q,0),del=mode==='Delivery'?Number(S.biz.del)||0:0;
 const fecha=new Date(date+'T12:00').toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 const lines=[`Hola ${S.biz.name}, quiero hacer este pedido:`,...cart.map(i=>`• ${i.q} x ${i.n} (${i.s}) — ${money(i.p*i.q)}`),
  $('cNote').value.trim()?`Nota: "${$('cNote').value.trim()}"`:'',`Entrega: ${mode} — ${fecha}`,mode==='Delivery'?`Dirección: ${addr}`:'',
  $('cPay')?.value ? `Pago: ${$('cPay').value}` : '',mode==='Delivery'?`Delivery: ${money(del)}`:'',`Total: ${money(sub+del)}`,`Nombre: ${name}`].filter(Boolean);
 btn.href=`https://wa.me/${S.biz.phone}?text=${encodeURIComponent(wellFormed(lines.join('\n')))}`}

function open(id){$(id).classList.add('on');$('scrim').classList.add('on')}
function closeAll(){$('cart').classList.remove('on');$('scrim').classList.remove('on')}


function addProduct(id) {
  const product = S.products.find(item => item.id === id);
  if (!product || product.out) return;
  const index = Number($('sz' + id)?.value);
  const size = product.s[index];
  if (!size) return;

  const [name, price] = size;
  const existing = cart.find(item => item.id === id && item.sizeIndex === index);
  if (existing) existing.q++;
  else cart.push({id, sizeIndex: index, n: product.n, s: name, p: price, q: 1});
  renderCart();
  toast(product.n + ' agregado al pedido');
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const {f, add, q, d, m, close} = button.dataset;
  if (f !== undefined) {
    filter = Number(f);
    renderChips();
    renderGrid();
  }
  if (add !== undefined) addProduct(Number(add));
  if (q !== undefined && cart[q]) {
    cart[q].q += Number(d);
    if (cart[q].q < 1) cart.splice(Number(q), 1);
    renderCart();
  }
  if (m) {
    mode = m;
    renderCart();
  }
  if (close !== undefined) closeAll();
});
$('openCart').onclick = () => { renderCart(); open('cart'); };
$('scrim').onclick = closeAll;
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAll(); });
document.addEventListener('error', event => {
  if (event.target.matches?.('img.ph')) event.target.remove();
}, true);
$('cartBody').addEventListener('input', updateWA);
$('cartBody').addEventListener('change', updateWA);
loadCatalog();
