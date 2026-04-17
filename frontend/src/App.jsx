// App.jsx — SAP O2C Dashboard Root
import React from 'react';
import { useO2CApi } from './hooks/useO2CApi';
import PipelineSummary from './components/PipelineSummary';
import OrdersTable     from './components/OrdersTable';
import NewOrderForm    from './components/NewOrderForm';
import Toast           from './components/Toast';

export default function App() {
  const { orders, summary, customers, loading, error, toast, createOrder, advanceStatus } = useO2CApi();

  return (
    <div style={{ maxWidth:1400, margin:'0 auto', padding:'1.5rem' }}>

      {/* ── Top Header Bar ── */}
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:'2rem', paddingBottom:'1.25rem',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          {/* SAP Logo Pill */}
          <div style={{
            background:'linear-gradient(135deg,#1c6ef3,#0052cc)',
            color:'white', fontWeight:900, fontSize:'1rem', letterSpacing:'0.1em',
            padding:'6px 14px', borderRadius:'4px', fontFamily:'var(--font-mono)',
            boxShadow:'0 2px 12px rgba(28,110,243,0.4)',
          }}>SAP</div>
          <div>
            <h1 style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text-primary)', lineHeight:1.2 }}>
              Order-to-Cash Dashboard
            </h1>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.08em' }}>
              MOCK ECC/S4HANA · SALES ORG 1000/2000 · DIST CHANNEL 10/20
            </div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          {/* Connection Status */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px',
            fontFamily:'var(--font-mono)', fontSize:'0.7rem',
            color: error ? 'var(--accent-red)' : 'var(--accent-green)' }}>
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background: error ? 'var(--accent-red)' : 'var(--accent-green)',
              boxShadow: error ? '0 0 8px var(--accent-red)' : '0 0 8px var(--accent-green)',
              animation: error ? 'none' : 'pulse 2s infinite',
            }}/>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            {error ? 'BACKEND OFFLINE' : 'CONNECTED · :3000'}
          </div>

          {/* Current Date */}
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
          </div>
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          marginBottom:'1.5rem', padding:'1rem 1.25rem',
          background:'rgba(255,77,77,0.08)', border:'1px solid rgba(255,77,77,0.3)',
          borderRadius:'var(--radius-md)', color:'var(--accent-red)',
          fontFamily:'var(--font-mono)', fontSize:'0.8rem',
          display:'flex', alignItems:'center', gap:'0.75rem',
        }}>
          <span style={{ fontSize:'1.1rem' }}>⚠</span>
          <div>
            <div style={{ fontWeight:600, marginBottom:2 }}>Cannot connect to SAP Mock Backend</div>
            <div style={{ opacity:0.7 }}>
              Error: {error} — Ensure the backend is running: <code>cd backend && npm start</code>
            </div>
          </div>
        </div>
      )}

      {/* ── Pipeline KPI Summary ── */}
      <PipelineSummary summary={summary} />

      {/* ── New Order Form (VA01) ── */}
      <NewOrderForm customers={customers} onCreate={createOrder} />

      {/* ── Orders Table ── */}
      <OrdersTable orders={orders} onAdvance={advanceStatus} loading={loading && orders.length === 0} />

      {/* ── Footer ── */}
      <footer style={{
        marginTop:'3rem', paddingTop:'1rem', borderTop:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)',
      }}>
        <span>SAP O2C DASHBOARD · CAPSTONE PROJECT · MOCK ENVIRONMENT</span>
        <span style={{ color:'var(--border-bright)' }}>
          React {React.version} · Vite · Node.js/Express
        </span>
      </footer>

      {/* ── Toast Notifications ── */}
      <Toast toast={toast} />
    </div>
  );
}
