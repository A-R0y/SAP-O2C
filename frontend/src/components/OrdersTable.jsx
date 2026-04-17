// components/OrdersTable.jsx
import React, { useState } from 'react';

const STAGE_COLORS = ['#3b4a6b','#1a5fb4','#0891b2','#7c3aed','#059669'];
const STAGE_TEXT   = ['#8ca6cf','#7ab3ff','#67d8f0','#c4b5fd','#6ee7b7'];

function StatusBadge({ status, statusLabel, stageIndex }) {
  const bg   = STAGE_COLORS[stageIndex] || '#3b4a6b';
  const text = STAGE_TEXT[stageIndex]   || '#8ca6cf';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'4px',
      background:`${bg}30`, color: text, border:`1px solid ${bg}80`,
      borderRadius:'20px', padding:'2px 10px',
      fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.05em',
      whiteSpace:'nowrap',
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:text, display:'inline-block' }} />
      {statusLabel}
    </span>
  );
}

function ProgressDots({ stageIndex, totalStages }) {
  return (
    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
      {Array.from({ length: totalStages }).map((_, i) => (
        <div key={i} style={{
          width: i <= stageIndex ? 8 : 6,
          height: i <= stageIndex ? 8 : 6,
          borderRadius:'50%',
          background: i <= stageIndex ? STAGE_COLORS[i] : 'var(--border)',
          border: i === stageIndex ? `2px solid ${STAGE_TEXT[i]}` : 'none',
          transition:'all 0.3s ease',
        }} />
      ))}
    </div>
  );
}

export default function OrdersTable({ orders, onAdvance, loading }) {
  const [advancing, setAdvancing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStage, setFilterStage] = useState('ALL');

  const stages = ['ALL','ORDER_CREATED','DELIVERY_CREATED','GOODS_ISSUED','INVOICE_GENERATED','PAYMENT_RECEIVED'];
  const stageLabels = { ALL:'All Stages', ORDER_CREATED:'Order Created', DELIVERY_CREATED:'Delivery Created',
    GOODS_ISSUED:'Goods Issued', INVOICE_GENERATED:'Invoice Generated', PAYMENT_RECEIVED:'Payment Received' };

  const filtered = filterStage === 'ALL' ? orders : orders.filter(o => o.status === filterStage);

  const handleAdvance = async (orderId) => {
    setAdvancing(orderId);
    try { await onAdvance(orderId); }
    finally { setAdvancing(null); }
  };

  return (
    <section>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <h2 style={{ color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--accent-amber)',
            background:'rgba(245,166,35,0.12)', padding:'2px 8px', borderRadius:'3px', letterSpacing:'0.08em' }}>
            VBAK
          </span>
          Sales Orders
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:400 }}>
            ({filtered.length})
          </span>
        </h2>

        {/* Stage Filter */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          {stages.map((s, i) => (
            <button key={s} onClick={() => setFilterStage(s)}
              style={{
                padding:'4px 12px', borderRadius:'20px', cursor:'pointer',
                fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.05em',
                border:`1px solid ${filterStage===s ? (STAGE_COLORS[i-1]||'var(--accent-blue)') : 'var(--border)'}`,
                background: filterStage===s ? `${(STAGE_COLORS[i-1]||'#1c6ef3')}25` : 'transparent',
                color: filterStage===s ? (STAGE_TEXT[i-1]||'var(--accent-blue)') : 'var(--text-secondary)',
                transition:'all 0.18s',
              }}>
              {stageLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
        {/* Table Header */}
        <div style={{
          display:'grid', gridTemplateColumns:'130px 1fr 1fr 100px 120px 160px 140px',
          padding:'0.75rem 1rem', background:'rgba(0,0,0,0.3)',
          borderBottom:'1px solid var(--border)',
          fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)',
          letterSpacing:'0.08em', textTransform:'uppercase',
        }}>
          <span>Order ID</span>
          <span>Customer</span>
          <span>Dates</span>
          <span>Value</span>
          <span>Progress</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem', letterSpacing:'0.1em' }}>
              LOADING ORDERS...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>
            NO ORDERS IN THIS STAGE
          </div>
        ) : (
          filtered.map((order, idx) => (
            <React.Fragment key={order.orderId}>
              <div
                onClick={() => setExpandedId(expandedId === order.orderId ? null : order.orderId)}
                style={{
                  display:'grid', gridTemplateColumns:'130px 1fr 1fr 100px 120px 160px 140px',
                  padding:'0.875rem 1rem', cursor:'pointer',
                  borderBottom:`1px solid ${expandedId===order.orderId ? 'transparent' : 'var(--border)'}`,
                  background: expandedId===order.orderId ? 'var(--bg-card-hover)' :
                    idx%2===0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  alignItems:'center',
                  transition:'background 0.18s',
                }}>
                {/* Order ID */}
                <div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem', color:'var(--accent-cyan)', fontWeight:600 }}>
                    {order.orderId}
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text-muted)', marginTop:2 }}>
                    Org: {order.salesOrg}
                  </div>
                </div>

                {/* Customer */}
                <div>
                  <div style={{ fontSize:'0.82rem', fontWeight:500, color:'var(--text-primary)' }}>{order.customerName}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                    {order.customerId} · {order.customerRegion}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>
                    <span style={{ color:'var(--text-muted)' }}>ORD </span>{order.orderDate}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginTop:2 }}>
                    <span style={{ color:'var(--text-muted)' }}>REQ </span>{order.requestedDate}
                  </div>
                </div>

                {/* Value */}
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem', fontWeight:600, color:'var(--accent-green)' }}>
                  ₹{order.totalValue.toLocaleString('en-IN')}
                  <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontWeight:400 }}>{order.currency}</div>
                </div>

                {/* Progress dots */}
                <div>
                  <ProgressDots stageIndex={order.stageIndex} totalStages={order.totalStages} />
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text-muted)', marginTop:4 }}>
                    {order.stageIndex + 1}/{order.totalStages}
                  </div>
                </div>

                {/* Status Badge */}
                <div><StatusBadge status={order.status} statusLabel={order.statusLabel} stageIndex={order.stageIndex} /></div>

                {/* Action Button */}
                <div onClick={e => e.stopPropagation()}>
                  {order.nextActionLabel ? (
                    <button
                      onClick={() => handleAdvance(order.orderId)}
                      disabled={advancing === order.orderId}
                      style={{
                        padding:'5px 12px', borderRadius:'var(--radius-sm)', cursor:'pointer',
                        background: advancing===order.orderId ? 'var(--border)' : 'var(--accent-blue)',
                        color:'white', border:'none', fontSize:'0.72rem', fontWeight:600,
                        fontFamily:'var(--font-sans)', whiteSpace:'nowrap',
                        opacity: advancing===order.orderId ? 0.6 : 1,
                      }}>
                      {advancing === order.orderId ? '...' : order.nextActionLabel}
                    </button>
                  ) : (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--accent-green)' }}>
                      ✓ COMPLETE
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded row — Line Items */}
              {expandedId === order.orderId && (
                <div style={{
                  padding:'1rem 1rem 1rem 2.5rem',
                  background:'rgba(28,110,243,0.04)',
                  borderBottom:'1px solid var(--border)',
                  borderTop:'1px solid rgba(28,110,243,0.2)',
                }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--accent-blue)',
                    letterSpacing:'0.1em', marginBottom:'0.75rem', textTransform:'uppercase' }}>
                    VBAP — Line Items for {order.orderId}
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.75rem' }}>
                    <thead>
                      <tr style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.65rem',
                        letterSpacing:'0.06em', textTransform:'uppercase' }}>
                        {['Item','Material','Description','Qty','UOM','Unit Price','Net Value'].map(h => (
                          <th key={h} style={{ textAlign:'left', padding:'4px 12px 4px 0', fontWeight:400 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.itemId} style={{ color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
                          <td style={{ padding:'6px 12px 6px 0', fontFamily:'var(--font-mono)' }}>{item.itemId}</td>
                          <td style={{ padding:'6px 12px 6px 0', fontFamily:'var(--font-mono)', color:'var(--accent-cyan)', fontSize:'0.7rem' }}>{item.material}</td>
                          <td style={{ padding:'6px 12px 6px 0', color:'var(--text-primary)' }}>{item.description}</td>
                          <td style={{ padding:'6px 12px 6px 0', fontFamily:'var(--font-mono)' }}>{item.quantity}</td>
                          <td style={{ padding:'6px 12px 6px 0', fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>{item.uom}</td>
                          <td style={{ padding:'6px 12px 6px 0', fontFamily:'var(--font-mono)' }}>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td style={{ padding:'6px 12px 6px 0', fontFamily:'var(--font-mono)', color:'var(--accent-green)', fontWeight:600 }}>₹{item.netValue.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </section>
  );
}
