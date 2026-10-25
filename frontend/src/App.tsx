import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import MovementsPage from './pages/MovementsPage';
import SettingsPage from './pages/SettingsPage';

type Product = { _id: string; nombre: string; sku: string; descripcion: string; imagen?: string; categoria: string; precio: number; stock: number; stockMinimo: number; activo: boolean };
type ProductDraft = Omit<Product, '_id'>;
type ApiError = { mensaje?: string; detalles?: string[]; errors?: { message?: string }[] };
const blank: ProductDraft = { nombre: '', sku: '', descripcion: '', imagen: '', categoria: '', precio: 0, stock: 0, stockMinimo: 5, activo: true };
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const productPhotos = [
  { imagen: '/product-images/auriculares-gadnic.webp', nombre: 'Auriculares', marca: 'Gadnic', keywords: ['auricular', 'headphone', 'audifono', 'gadnic', 'ablue164'] },
  { imagen: '/product-images/tostadora-peabody.jpg', nombre: 'Tostadora', marca: 'Peabody Smartchef', keywords: ['tostadora', 'tostador', 'peabody', '39699'] },
  { imagen: '/product-images/teclado-logitech-k250.webp', nombre: 'Teclado inalámbrico', marca: 'Logitech K250', keywords: ['teclado', 'keyboard', 'logitech', 'k-250'] },
  { imagen: '/product-images/pava-lusqtoff.jpg', nombre: 'Pava eléctrica', marca: 'Lusqtoff', keywords: ['pava', 'hervidor', 'jarra electrica', 'lusqtoff', 'pv802'] },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiError;
    throw new Error(body.mensaje || body.detalles?.join(', ') || body.errors?.[0]?.message || `Error ${response.status}: no se pudo completar la solicitud`);
  }
  return (response.status === 204 ? undefined : response.json()) as Promise<T>;
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.4.8l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.4-.8l-1.7.7-1.4-2.4L8 15a7 7 0 0 1 0-1.8l-1.5-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.4-.8l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.4.8l1.7-.7 1.4 2.4-1.5 1.1a7 7 0 0 1 0 1.8Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    dots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    down: <path d="m7 10 5 5 5-5"/>,
    up: <path d="m7 14 5-5 5 5"/>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.4-3"/></>,
    sliders: <><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4"/></>,
    warning: <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function initials(product: Product) { return product.nombre.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase(); }

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const normalized = `${product.nombre} ${product.sku} ${product.categoria}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const suggested = productPhotos.find(photo => photo.keywords.some(keyword => normalized.includes(keyword)))?.imagen;
  const source = product.imagen || suggested;
  return source && !failed
    ? <img className="product-thumb product-photo" src={source} alt={product.nombre} onError={() => setFailed(true)} />
    : <div className={`product-thumb hue-${product.nombre.charCodeAt(0) % 5}`}>{initials(product)}</div>;
}

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#\/?/, '') || 'inventario');
  const [workspaceName, setWorkspaceName] = useState(() => localStorage.getItem('controlstock.workspace') || 'Bolado Studio');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState<'product' | 'stock' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [photoDelete, setPhotoDelete] = useState<{ name: string; products: Product[] } | null>(null);
  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [stockAmount, setStockAmount] = useState('');
  const [draft, setDraft] = useState<ProductDraft>(blank);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const onRouteChange = () => setRoute(window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'inventario');
    window.addEventListener('hashchange', onRouteChange);
    return () => window.removeEventListener('hashchange', onRouteChange);
  }, []);
  useEffect(() => {
    const onWorkspaceChange = () => setWorkspaceName(localStorage.getItem('controlstock.workspace') || 'Bolado Studio');
    window.addEventListener('storage', onWorkspaceChange);
    window.addEventListener('controlstock-workspace-change', onWorkspaceChange);
    return () => { window.removeEventListener('storage', onWorkspaceChange); window.removeEventListener('controlstock-workspace-change', onWorkspaceChange); };
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const params = new URLSearchParams({ pagina: String(page), limite: '10' });
    if (query.trim()) params.set('buscar', query.trim());
    if (category) params.set('categoria', category);
    if (lowOnly) params.set('bajoStock', 'true');
    try {
      const data = await request<{ productos: Product[]; paginacion: { total: number; paginas: number } }>(`/productos?${params}`);
      setProducts(data.productos); setTotal(data.paginacion.total); setPages(Math.max(data.paginacion.paginas, 1));
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo conectar con la API'); }
    finally { setLoading(false); }
  }, [page, query, category, lowOnly]);

  useEffect(() => { const id = window.setTimeout(load, 250); return () => window.clearTimeout(id); }, [load]);
  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(id); }, [toast]);

  const categories = useMemo(() => [...new Set(products.map(p => p.categoria))].sort(), [products]);
  const lowCount = products.filter(p => p.stock <= p.stockMinimo).length;
  const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.precio, 0);
  const rangeStart = total ? (page - 1) * 10 + 1 : 0;
  const rangeEnd = Math.min(page * 10, total);

  function openCreate() { setEditing(null); setDraft(blank); setModal('product'); }
  function openCreateWithImage(imagen: string) { setEditing(null); setDraft({ ...blank, imagen }); setModal('product'); }
  function openEdit(product: Product) { setEditing(product); setDraft({ nombre: product.nombre, sku: product.sku, descripcion: product.descripcion || '', imagen: product.imagen || '', categoria: product.categoria, precio: product.precio, stock: product.stock, stockMinimo: product.stockMinimo, activo: product.activo }); setModal('product'); }
  async function saveProduct(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const path = editing ? `/productos/${editing._id}` : '/productos';
      await request(path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(draft) });
      setModal(null); setToast(editing ? 'Producto actualizado correctamente' : 'Producto agregado al inventario'); await load();
    } catch (e) { setToast(e instanceof Error ? e.message : 'No se pudo guardar el producto'); }
    finally { setSaving(false); }
  }
  async function removeProduct(product: Product) {
    if (!window.confirm(`¿Eliminar ${product.nombre} del inventario?`)) return;
    try { await request(`/productos/${product._id}`, { method: 'DELETE' }); setToast('Producto eliminado'); await load(); }
    catch (e) { setToast(e instanceof Error ? e.message : 'No se pudo eliminar'); }
  }
  async function deletePhotoProduct(photo: typeof productPhotos[number]) {
    try {
      const data = await request<{ productos: Product[] }>('/productos?pagina=1&limite=100');
      const matches = data.productos.filter(product => {
        const normalized = `${product.nombre} ${product.sku} ${product.categoria}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return product.imagen === photo.imagen || photo.keywords.some(keyword => normalized.includes(keyword));
      });
      if (matches.length === 0) { setToast(`No hay un producto asociado a la foto de ${photo.nombre}.`); return; }
      if (matches.length === 1) { await removeProduct(matches[0]); return; }
      setPhotoDelete({ name: photo.nombre, products: matches });
    } catch (e) { setToast(e instanceof Error ? e.message : 'No se pudieron buscar los productos'); }
  }
  async function adjustStock(event: FormEvent) {
    event.preventDefault(); if (!stockTarget) return;
    const quantity = Number(stockAmount); if (!Number.isInteger(quantity) || quantity === 0) { setToast('Ingresá una cantidad entera distinta de cero'); return; }
    setSaving(true);
    try { await request(`/productos/${stockTarget._id}/stock`, { method: 'PATCH', body: JSON.stringify({ cantidad: quantity }) }); setModal(null); setStockTarget(null); setStockAmount(''); setToast('Stock actualizado'); await load(); }
    catch (e) { setToast(e instanceof Error ? e.message : 'No se pudo actualizar el stock'); }
    finally { setSaving(false); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#/dashboard" aria-label="Stockroom inicio"><span className="brand-mark"><Icon name="box" size={21}/></span><span>stockroom<span className="brand-dot">.</span></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-switch"><span className="workspace-avatar">{workspaceName.slice(0, 1).toUpperCase()}</span><span className="workspace-copy"><strong>{workspaceName}</strong><small>Plan gratuito</small></span><Icon name="down" size={16}/></div>
      <div className="nav-label">MENU PRINCIPAL</div>
      <nav className="nav-list"><a className={`nav-item ${route === 'dashboard' ? 'active' : ''}`} href="#/dashboard"><Icon name="grid"/>Resumen</a><a className={`nav-item ${route === 'inventario' || !['dashboard', 'movimientos', 'configuracion'].includes(route) ? 'active' : ''}`} href="#/inventario"><Icon name="box"/>Inventario<span className="nav-count">{total}</span></a><a className={`nav-item ${route === 'movimientos' ? 'active' : ''}`} href="#/movimientos"><Icon name="chart"/>Movimientos</a></nav>
      <div className="nav-label tools-label">GESTIÓN</div>
      <nav className="nav-list"><a className={`nav-item ${route === 'configuracion' ? 'active' : ''}`} href="#/configuracion"><Icon name="settings"/>Configuración</a></nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✳</div><strong>¿Necesitás una mano?</strong><p>Estamos para ayudarte a organizar tu inventario.</p><button onClick={() => setToast('Escribinos a soporte@stockroom.app')}>Contactar soporte <Icon name="arrow" size={14}/></button></div><div className="profile"><div className="profile-avatar">CB</div><div className="profile-copy"><strong>Cecilia Bolado</strong><small>Administradora</small></div><button className="icon-button profile-menu" aria-label="Opciones de perfil"><Icon name="dots"/></button></div></div>
    </aside>

    <main className="main-content" id="inventario">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{route === 'dashboard' ? 'Resumen' : route === 'movimientos' ? 'Movimientos' : route === 'configuracion' ? 'Configuración' : 'Inventario'}</strong></div><div className="top-actions"><span className="sync-status"><i/>Todos los cambios guardados</span><button className="icon-button notification" aria-label="Notificaciones"><span className="notification-dot"/>♧</button><span className="top-avatar">CB</span></div></header>
      {route === 'dashboard' ? <div className="content-wrap"><DashboardPage/></div> : route === 'movimientos' ? <div className="content-wrap"><MovementsPage/></div> : route === 'configuracion' ? <div className="content-wrap"><SettingsPage/></div> : <div className="content-wrap">
        <div className="page-heading"><div><div className="eyebrow">GESTIÓN DE STOCK <span>·</span> {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</div><h1>Inventario <span className="heading-count">{total}</span></h1><p>Controlá tus productos y mantené tu stock siempre al día.</p></div><button className="primary-button" onClick={openCreate}><Icon name="plus"/> Agregar producto</button></div>

        <section className="stats-grid" aria-label="Resumen del inventario">
          <article className="stat-card"><div className="stat-top"><span>PRODUCTOS EN TOTAL</span><span className="stat-icon green"><Icon name="box" size={17}/></span></div><div className="stat-value">{total}</div><div className="stat-note"><span className="note-green"><Icon name="trend" size={13}/> Inventario activo</span><span>en tu catálogo</span></div><div className="sparkline green-line"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M1 24 C10 22 12 18 20 19 S31 15 38 18 49 10 56 14 68 11 75 12 86 5 99 3"/></svg></div></article>
          <article className="stat-card"><div className="stat-top"><span>STOCK BAJO</span><span className="stat-icon amber"><Icon name="warning" size={17}/></span></div><div className="stat-value">{lowCount}</div><div className="stat-note"><span className={lowCount ? 'note-amber' : 'note-green'}>{lowCount ? 'Requiere atención' : 'Todo en orden'}</span><span>en esta página</span></div><div className="sparkline amber-line"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M1 24 C10 22 16 26 24 19 S35 20 44 15 52 20 60 14 70 17 78 10 91 12 99 4"/></svg></div></article>
          <article className="stat-card"><div className="stat-top"><span>VALOR DEL INVENTARIO</span><span className="stat-icon blue"><span className="currency-icon">$</span></span></div><div className="stat-value value-currency">{money.format(inventoryValue)}</div><div className="stat-note"><span>Valorización estimada</span><span>de esta página</span></div><div className="sparkline blue-line"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M1 25 C11 24 14 18 23 20 S32 16 41 18 50 12 60 14 68 10 77 12 87 4 99 2"/></svg></div></article>
        </section>

        <section className="photo-library" aria-label="Fotos de productos disponibles"><div className="photo-library-heading"><div><h2>Fotos de productos</h2><p>Usá una foto para agregar el producto o eliminá el producto asociado.</p></div><span>{productPhotos.length} imágenes</span></div><div className="photo-grid">{productPhotos.map(photo => <article className="photo-card" key={photo.imagen}><div className="photo-preview"><img src={photo.imagen} alt={`${photo.nombre} ${photo.marca}`}/></div><div className="photo-card-info"><div><strong>{photo.nombre}</strong><span>{photo.marca}</span></div></div><div className="photo-card-actions"><button type="button" className="photo-add-button" onClick={() => openCreateWithImage(photo.imagen)}>Agregar producto</button><button type="button" className="photo-delete-button" onClick={() => deletePhotoProduct(photo)}>Eliminar producto</button></div></article>)}</div></section>

        <section className="inventory-panel"><div className="panel-header"><div><h2>Todos los productos</h2><p>Administrá y organizá tus productos</p></div><button className={`filter-button ${lowOnly ? 'filter-on' : ''}`} onClick={() => { setLowOnly(!lowOnly); setPage(1); }}><Icon name="sliders" size={16}/> Filtros {lowOnly && <span className="filter-dot"/>}</button></div>
          <div className="toolbar"><label className="search-field"><Icon name="search" size={17}/><input aria-label="Buscar productos" placeholder="Buscar por nombre o SKU..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }}/><kbd>⌘ K</kbd></label><label className="select-wrap"><span className="sr-only">Categoría</span><select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">Todas las categorías</option>{categories.map(cat => <option key={cat}>{cat}</option>)}</select><Icon name="down" size={15}/></label><button className="toolbar-icon" aria-label="Actualizar" onClick={load}><Icon name="refresh" size={16}/></button></div>
          {error && <div className="error-banner"><Icon name="warning" size={17}/><span>{error}</span><button onClick={load}>Reintentar</button></div>}
          <div className="table-wrap"><table><thead><tr><th className="product-col">PRODUCTO</th><th>CATEGORÍA</th><th>SKU</th><th>PRECIO</th><th>STOCK DISPONIBLE</th><th>ESTADO</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>
            {loading ? <tr><td colSpan={7} className="empty-state"><span className="loader"/>Cargando inventario...</td></tr> : products.length === 0 ? <tr><td colSpan={7} className="empty-state"><span className="empty-icon"><Icon name="box" size={22}/></span><strong>{error ? 'No pudimos cargar los productos' : 'No encontramos productos'}</strong><span>{query || category || lowOnly ? 'Probá cambiando los filtros de búsqueda.' : 'Agregá tu primer producto para empezar a organizar tu inventario.'}</span>{!query && !category && !lowOnly && <button className="primary-button compact" onClick={openCreate}><Icon name="plus" size={16}/> Agregar producto</button>}</td></tr> : products.map(product => {
              const low = product.stock <= product.stockMinimo;
              return <tr key={product._id}><td><div className="product-cell"><ProductImage product={product}/><div className="product-copy"><strong>{product.nombre}</strong><span>{product.descripcion || 'Sin descripción'}</span></div></div></td><td><span className="category-pill">{product.categoria}</span></td><td><span className="sku">{product.sku}</span></td><td className="price-cell">{money.format(product.precio)}</td><td><button className="stock-cell" title="Ajustar stock" onClick={() => { setStockTarget(product); setStockAmount(''); setModal('stock'); }}><span className={low ? 'stock-low' : ''}>{product.stock} un.</span><span className="stock-min">Mín. {product.stockMinimo}</span></button></td><td><span className={`status-pill ${low ? 'status-low' : 'status-ok'}`}><i/>{low ? 'Stock bajo' : 'En stock'}</span></td><td><div className="row-actions"><button className="action-button" title="Ajustar stock" onClick={() => { setStockTarget(product); setStockAmount(''); setModal('stock'); }}>±</button><button className="action-button" title="Editar producto" onClick={() => openEdit(product)}>✎</button><button className="action-button delete-action" title="Eliminar producto" onClick={() => removeProduct(product)}>×</button></div></td></tr>;
            })}
          </tbody></table></div>
          <div className="table-footer"><span>Mostrando <strong>{rangeStart}–{rangeEnd}</strong> de <strong>{total}</strong> productos</span><div className="pagination"><button className="page-button" aria-label="Página anterior" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>‹</button>{Array.from({ length: Math.min(pages, 5) }, (_, i) => { const n = pages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, pages - 4)) + i; return <button key={n} className={`page-button ${page === n ? 'page-active' : ''}`} onClick={() => setPage(n)}>{n}</button>; })}<button className="page-button" aria-label="Página siguiente" disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>›</button></div></div>
        </section>
        <footer className="footer"><span>© 2025 Stockroom. Hecho para que tu negocio crezca.</span><div><a href="#">Ayuda</a><a href="#">Privacidad</a><a href="#">Términos</a></div></footer>
      </div>}
    </main>

    {modal === 'product' && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><form className="modal-card" onSubmit={saveProduct}><div className="modal-heading"><div><span className="modal-kicker">INVENTARIO</span><h2>{editing ? 'Editar producto' : 'Agregar producto'}</h2><p>Completá los datos para mantener tu catálogo actualizado.</p></div><button type="button" className="icon-button" onClick={() => setModal(null)} aria-label="Cerrar"><Icon name="close"/></button></div><div className="form-grid"><label className="form-field full"><span>Nombre del producto <b>*</b></span><input autoFocus required maxLength={100} value={draft.nombre} onChange={e => setDraft({ ...draft, nombre: e.target.value })} placeholder="Ej. Auriculares inalámbricos"/></label><label className="form-field"><span>SKU <b>*</b></span><input required maxLength={40} value={draft.sku} onChange={e => setDraft({ ...draft, sku: e.target.value.toUpperCase() })} placeholder="Ej. AUR-001"/></label><label className="form-field"><span>Categoría <b>*</b></span><input required maxLength={60} value={draft.categoria} onChange={e => setDraft({ ...draft, categoria: e.target.value })} placeholder="Ej. Electrónica"/></label><label className="form-field"><span>Precio <b>*</b></span><div className="input-prefix"><span>$</span><input type="number" required min="0" step="0.01" value={draft.precio} onChange={e => setDraft({ ...draft, precio: Number(e.target.value) })}/></div></label><label className="form-field"><span>Stock inicial <b>*</b></span><input type="number" required min="0" step="1" value={draft.stock} onChange={e => setDraft({ ...draft, stock: Number(e.target.value) })}/></label><label className="form-field"><span>Stock mínimo <b>*</b></span><input type="number" required min="0" step="1" value={draft.stockMinimo} onChange={e => setDraft({ ...draft, stockMinimo: Number(e.target.value) })}/></label><label className="form-field full"><span>Imagen del producto</span><input type="url" value={draft.imagen || ''} onChange={e => setDraft({ ...draft, imagen: e.target.value })} placeholder="https://ejemplo.com/imagen.jpg"/><small>Pegá un enlace directo a la imagen. Se verá en el listado de productos.</small></label><label className="form-field full"><span>Descripción</span><textarea rows={3} maxLength={500} value={draft.descripcion} onChange={e => setDraft({ ...draft, descripcion: e.target.value })} placeholder="Detalles opcionales del producto"/></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : <><Icon name="plus" size={16}/> Agregar producto</>}</button></div></form></div>}
    {modal === 'stock' && stockTarget && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><form className="modal-card stock-modal" onSubmit={adjustStock}><div className="modal-heading"><div><span className="modal-kicker">AJUSTE DE INVENTARIO</span><h2>Actualizar stock</h2><p>Sumá unidades o registrá una salida de productos.</p></div><button type="button" className="icon-button" onClick={() => setModal(null)} aria-label="Cerrar"><Icon name="close"/></button></div><div className="stock-product"><ProductImage product={stockTarget}/><div><strong>{stockTarget.nombre}</strong><span>{stockTarget.sku} · Stock actual: {stockTarget.stock} un.</span></div></div><label className="form-field"><span>Cantidad <b>*</b></span><input autoFocus type="number" required step="1" value={stockAmount} onChange={e => setStockAmount(e.target.value)} placeholder="Ej. 10 para entrada, -3 para salida"/><small>Usá un valor positivo para agregar o negativo para descontar.</small></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Actualizando...' : 'Actualizar stock'}</button></div></form></div>}
    {photoDelete && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setPhotoDelete(null); }}><section className="modal-card photo-delete-modal"><div className="modal-heading"><div><span className="modal-kicker">ELIMINAR PRODUCTO</span><h2>Elegí el producto</h2><p>Hay varios productos asociados a la foto de {photoDelete.name}.</p></div><button type="button" className="icon-button" onClick={() => setPhotoDelete(null)} aria-label="Cerrar"><Icon name="close"/></button></div><div className="photo-delete-list">{photoDelete.products.map(product => <div className="photo-delete-row" key={product._id}><div><strong>{product.nombre}</strong><span>{product.sku}</span></div><button type="button" className="photo-delete-button" onClick={async () => { setPhotoDelete(null); await removeProduct(product); }}>Eliminar producto</button></div>)}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setPhotoDelete(null)}>Cancelar</button></div></section></div>}
    {toast && <div className="toast"><span className="toast-check"><Icon name="check" size={15}/></span>{toast}<button onClick={() => setToast('')} aria-label="Cerrar">×</button></div>}
  </div>;
}
