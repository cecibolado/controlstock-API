import { useEffect, useState } from 'react';

type Product = { _id: string; nombre: string; sku: string; categoria: string; stock: number; stockMinimo: number; precio: number; imagen?: string };
type Summary = { productos: Product[]; paginacion: { total: number } };
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/productos?pagina=1&limite=100').then(async response => { if (!response.ok) throw new Error('No se pudo cargar el resumen. Revisá que la API esté iniciada.'); return response.json(); }).then(setData).catch(e => setError(e.message)); }, []);
  const products = data?.productos || [];
  const low = products.filter(product => product.stock <= product.stockMinimo);
  const value = products.reduce((sum, product) => sum + product.stock * product.precio, 0);

  return <div className="page-view">
    <div className="page-heading"><div><div className="eyebrow">PANEL GENERAL</div><h1>Resumen</h1><p>Una mirada rápida al estado de tu inventario.</p></div><a className="primary-button" href="#/inventario">Ver inventario <span>→</span></a></div>
    {error && <div className="error-banner">{error}</div>}
    <section className="overview-grid">
      <article className="overview-card"><span>Productos registrados</span><strong>{data ? data.paginacion.total : '—'}</strong><small>Productos en tu catálogo</small></article>
      <article className="overview-card alert-card"><span>Necesitan reposición</span><strong>{data ? low.length : '—'}</strong><small>Stock bajo en los primeros 100 productos</small></article>
      <article className="overview-card"><span>Valor estimado</span><strong>{data ? money.format(value) : '—'}</strong><small>Calculado sobre los productos consultados</small></article>
    </section>
    <section className="inventory-panel overview-list"><div className="panel-header"><div><h2>Productos con stock bajo</h2><p>Productos que llegaron a su mínimo o están por debajo</p></div><a className="text-link" href="#/inventario">Ver inventario →</a></div>
      {!data ? <div className="overview-empty">Cargando resumen...</div> : low.length === 0 ? <div className="overview-empty">No hay productos con stock bajo entre los productos consultados.</div> : <div className="low-stock-list">{low.slice(0, 6).map(product => <div className="low-stock-row" key={product._id}><div className="low-stock-thumb">{product.nombre.slice(0, 1).toUpperCase()}</div><div className="low-stock-name"><strong>{product.nombre}</strong><span>{product.sku} · {product.categoria}</span></div><span className="low-stock-count">{product.stock} un. <small>/ mín. {product.stockMinimo}</small></span><span className="status-pill status-low"><i/>Reponer</span></div>)}</div>}
    </section>
  </div>;
}
