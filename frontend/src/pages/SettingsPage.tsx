import { FormEvent, useEffect, useState } from 'react';

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState(() => localStorage.getItem('controlstock.workspace') || 'Bolado Studio');
  const [draft, setDraft] = useState(workspace);
  const [apiState, setApiState] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState('');
  useEffect(() => { fetch('/api/health').then(response => { if (!response.ok) throw new Error(); setApiState('connected'); }).catch(() => setApiState('error')); }, []);
  function save(event: FormEvent) { event.preventDefault(); const value = draft.trim(); if (!value) return; localStorage.setItem('controlstock.workspace', value); setWorkspace(value); window.dispatchEvent(new Event('controlstock-workspace-change')); setMessage('Configuración guardada en este navegador.'); window.setTimeout(() => setMessage(''), 2800); }
  return <div className="page-view">
    <div className="page-heading"><div><div className="eyebrow">PREFERENCIAS</div><h1>Configuración</h1><p>Administrá la información básica de tu espacio de trabajo.</p></div></div>
    <div className="settings-grid"><section className="inventory-panel settings-card"><div className="settings-heading"><h2>Espacio de trabajo</h2><p>Este nombre se guarda en el navegador que estás usando.</p></div><form onSubmit={save} className="settings-form"><label className="form-field"><span>Nombre del negocio</span><input value={draft} maxLength={60} onChange={event => setDraft(event.target.value)}/></label><button className="primary-button">Guardar cambios</button>{message && <span className="settings-message">{message}</span>}</form></section>
      <section className="inventory-panel settings-card"><div className="settings-heading"><h2>Conexión con la API</h2><p>Estado de la conexión entre el front y el backend.</p></div><div className="connection-row"><span className="connection-indicator"/><div><strong>{apiState === 'loading' ? 'Comprobando conexión…' : apiState === 'connected' ? 'API conectada' : 'Sin conexión con la API'}</strong><span>GET /api/health</span></div><span className={`connection-status ${apiState}`}>{apiState === 'connected' ? 'Activa' : apiState === 'error' ? 'Error' : '…'}</span></div></section></div>
  </div>;
}
