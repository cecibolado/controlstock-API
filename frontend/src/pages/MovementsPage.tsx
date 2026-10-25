import { useEffect, useState } from 'react';

type Movement = { _id: string; tipo: 'entrada' | 'salida'; cantidad: number; stockAntes: number; stockDespues: number; createdAt: string; producto: { nombre: string; sku: string } | null };
type Result = { movimientos: Movement[]; paginacion: { total: number; paginas: number } };
export default function MovementsPage() {
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { setResult(null); fetch(`/api/movimientos?pagina=${page}&limite=20${type ? `&tipo=${type}` : ''}`).then(async response => { if (!response.ok) throw new Error('No se pudo cargar el historial de movimientos.'); return response.json(); }).then(setResult).catch(e => setError(e.message)); }, [page, type]);
  return <div className="page-view">
    <div className="page-heading"><div><div className="eyebrow">ACTIVIDAD DEL INVENTARIO</div><h1>Movimientos</h1><p>Historial de entradas y salidas registradas al ajustar el stock.</p></div></div>
    <section className="inventory-panel movements-panel"><div className="panel-header"><div><h2>Historial de stock</h2><p>{result?.paginacion.total ?? '—'} movimientos registrados</p></div><label className="select-wrap movement-filter"><span className="sr-only">Filtrar por tipo</span><select value={type} onChange={event => { setType(event.target.value); setPage(1); }}><option value="">Todos los movimientos</option><option value="entrada">Entradas</option><option value="salida">Salidas</option></select></label></div>
      {error && <div className="error-banner">{error} Asegurate de reiniciar la API para activar el historial.</div>}
      <div className="table-wrap"><table><thead><tr><th>PRODUCTO</th><th>TIPO</th><th>CANTIDAD</th><th>STOCK ANTERIOR</th><th>STOCK NUEVO</th><th>FECHA</th></tr></thead><tbody>
        {error ? <tr><td colSpan={6} className="empty-state"><strong>No se pudo cargar el historial</strong><span>{error}</span></td></tr> : !result ? <tr><td colSpan={6} className="empty-state"><span className="loader"/>Cargando movimientos...</td></tr> : result.movimientos.length ? result.movimientos.map(movement => <tr key={movement._id}><td><div className="movement-product"><strong>{movement.producto?.nombre || 'Producto eliminado'}</strong><span>{movement.producto?.sku || '—'}</span></div></td><td><span className={`status-pill ${movement.tipo === 'entrada' ? 'status-ok' : 'status-low'}`}><i/>{movement.tipo === 'entrada' ? 'Entrada' : 'Salida'}</span></td><td className="price-cell">{movement.tipo === 'entrada' ? '+' : '−'}{movement.cantidad} un.</td><td>{movement.stockAntes} un.</td><td>{movement.stockDespues} un.</td><td>{new Date(movement.createdAt).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}</td></tr>) : <tr><td colSpan={6} className="empty-state"><strong>No hay movimientos todavía</strong><span>Los ajustes de stock que hagas desde Inventario aparecerán acá.</span><a className="text-link" href="#/inventario">Ir al inventario →</a></td></tr>}
      </tbody></table></div>
      <div className="table-footer"><span>Registros de stock</span><div className="pagination"><button className="page-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button><span className="page-number">{page} / {Math.max(1, result?.paginacion.paginas || 1)}</span><button className="page-button" disabled={page >= (result?.paginacion.paginas || 1)} onClick={() => setPage(page + 1)}>›</button></div></div>
    </section>
  </div>;
}
