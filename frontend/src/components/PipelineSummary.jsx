// components/PipelineSummary.jsx
import React from 'react';

const STAGE_COLORS = ['#3b4a6b','#1a5fb4','#0891b2','#7c3aed','#059669'];
const STAGE_ICONS  = ['📋','🚚','📦','🧾','✅'];

export default function PipelineSummary({ summary }) {
  if (!summary) return null;
  const { stages, totalOrders, grandTotalValue } = summary;

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <h2 style={{ color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--accent-blue)',
            background:'rgba(28,110,243,0.12)', padding:'2px 8px', borderRadius:'3px', letterSpacing:'0.08em' }}>
            PIPELINE
          </span>
          O2C Stage Overview
        </h2>
        <div style={{ display:'flex', gap:'1.5rem', fontFamily:'var(--font-mono)', fontSize:'0.75rem' }}>
          <span style={{ color:'var(--text-secondary)' }}>
            TOTAL ORDERS: <span style={{ color:'var(--accent-cyan)', fontWeight:600 }}>{totalOrders}</span>
          </span>
          <span style={{ color:'var(--text-secondary)' }}>
            PIPELINE VALUE: <span style={{ color:'var(--accent-green)', fontWeight:600 }}>
              ₹{grandTotalValue.toLocaleString('en-IN')}
            </span>
          </span>
        </div>
      </div>

      {/* Pipeline Flow Bar */}
      <div style={{ display:'flex', gap:'0', marginBottom:'1.25rem', borderRadius:'var(--radius-md)', overflow:'hidden', height:'6px' }}>
        {stages.map((s, i) => (
          <div key={s.stage} title={s.label}
            style={{
              flex: s.orderCount || 0.5,
              background: STAGE_COLORS[i],
              minWidth: '4px',
              transition: 'flex 0.5s ease',
            }} />
        ))}
      </div>

      {/* Stage Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.75rem' }}>
        {stages.map((s, i) => (
          <div key={s.stage} style={{
            background:'var(--bg-card)',
            border:`1px solid ${STAGE_COLORS[i]}40`,
            borderTop:`2px solid ${STAGE_COLORS[i]}`,
            borderRadius:'var(--radius-md)',
            padding:'1rem',
            position:'relative',
            overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:'0.75rem', right:'0.75rem', fontSize:'1.2rem', opacity:0.6 }}>
              {STAGE_ICONS[i]}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color: STAGE_COLORS[i],
              letterSpacing:'0.08em', marginBottom:'0.5rem', textTransform:'uppercase' }}>
              Stage {i+1}
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginBottom:'0.75rem', lineHeight:1.3 }}>
              {s.label}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.5rem', fontWeight:700,
              color:'var(--text-primary)', lineHeight:1 }}>
              {s.orderCount}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'0.25rem' }}>
              orders
            </div>
            {s.totalValue > 0 && (
              <div style={{ marginTop:'0.5rem', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color: STAGE_COLORS[i] }}>
                ₹{s.totalValue.toLocaleString('en-IN')}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
