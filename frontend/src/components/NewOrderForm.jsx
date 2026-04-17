// components/NewOrderForm.jsx
import React, { useState } from 'react';

const MATERIALS = [
  { id:'MAT-001', name:'SAP HANA License',       price:20000 },
  { id:'MAT-002', name:'S/4HANA Cloud Module',    price:87500 },
  { id:'MAT-003', name:'Fiori Launchpad Setup',   price:14400 },
  { id:'MAT-004', name:'BTP Integration Suite',   price:43000 },
  { id:'MAT-005', name:'Consulting Services',     price:25000 },
];

const emptyItem = () => ({ material:'MAT-001', description:'SAP HANA License', quantity:1, unitPrice:20000, uom:'EA' });

export default function NewOrderForm({ customers, onCreate }) {
  const [open, setOpen]     = useState(false);
  const [submitting, setSub] = useState(false);
  const [form, setForm]     = useState({
    customerId: '', requestedDate: '', items: [emptyItem()],
  });

  const addItem    = () => setForm(f => ({ ...f, items:[...f.items, emptyItem()] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_,idx)=>idx!==i) }));
  const updateItem = (i, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      if (field === 'material') {
        const mat = MATERIALS.find(m=>m.id===val);
        if (mat) { items[i].description = mat.name; items[i].unitPrice = mat.price; }
      }
      if (field === 'quantity') items[i].quantity = Number(val);
      if (field === 'unitPrice') items[i].unitPrice = Number(val);
      return { ...f, items };
    });
  };

  const totalValue = form.items.reduce((s,it) => s + (it.quantity||0)*(it.unitPrice||0), 0);

  const handleSubmit = async () => {
    if (!form.customerId || !form.requestedDate || form.items.length===0) return;
    setSub(true);
    try {
      await onCreate(form);
      setForm({ customerId:'', requestedDate:'', items:[emptyItem()] });
      setOpen(false);
    } catch(_) {}
    finally { setSub(false); }
  };

  const inputStyle = {
    background:'var(--bg-input)', border:'1px solid var(--border)', color:'var(--text-primary)',
    borderRadius:'var(--radius-sm)', padding:'8px 10px', fontSize:'0.82rem',
    fontFamily:'var(--font-sans)', width:'100%', outline:'none',
  };

  return (
    <section style={{ marginBottom:'2rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h2 style={{ color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--accent-green)',
            background:'rgba(0,229,160,0.1)', padding:'2px 8px', borderRadius:'3px', letterSpacing:'0.08em' }}>
            VA01
          </span>
          Create Sales Order
        </h2>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            padding:'8px 20px', background: open ? 'var(--bg-card)' : 'var(--accent-blue)',
            color:'white', border: open ? '1px solid var(--border)' : 'none',
            borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
          }}>
          {open ? '✕ Cancel' : '+ New Order'}
        </button>
      </div>

      {open && (
        <div style={{
          marginTop:'1rem', background:'var(--bg-card)', border:'1px solid var(--border-bright)',
          borderRadius:'var(--radius-lg)', padding:'1.5rem',
          boxShadow:'0 0 40px rgba(28,110,243,0.08)',
          animation:'slideDown 0.2s ease',
        }}>
          <style>{`@keyframes slideDown{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>

          {/* Header fields */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-muted)',
                fontFamily:'var(--font-mono)', letterSpacing:'0.08em', marginBottom:6, textTransform:'uppercase' }}>
                Sold-To Party (Customer) *
              </label>
              <select value={form.customerId} onChange={e=>setForm(f=>({...f,customerId:e.target.value}))}
                style={{...inputStyle}}>
                <option value="">— Select Customer —</option>
                {customers.map(c=>(
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerId} · {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-muted)',
                fontFamily:'var(--font-mono)', letterSpacing:'0.08em', marginBottom:6, textTransform:'uppercase' }}>
                Requested Delivery Date *
              </label>
              <input type="date" value={form.requestedDate}
                onChange={e=>setForm(f=>({...f,requestedDate:e.target.value}))}
                style={{...inputStyle}} />
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--accent-amber)',
                letterSpacing:'0.1em', textTransform:'uppercase' }}>
                VBAP — Line Items
              </div>
              <button onClick={addItem} style={{
                padding:'4px 12px', background:'rgba(0,229,160,0.1)', color:'var(--accent-green)',
                border:'1px solid rgba(0,229,160,0.3)', borderRadius:'var(--radius-sm)',
                cursor:'pointer', fontSize:'0.72rem', fontFamily:'var(--font-mono)',
              }}>+ Add Item</button>
            </div>

            {/* Item Header */}
            <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 80px 80px 60px 30px',
              gap:'0.5rem', marginBottom:'0.5rem',
              fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-muted)',
              letterSpacing:'0.07em', textTransform:'uppercase', padding:'0 4px' }}>
              <span>Material</span><span>Description</span><span>Qty</span><span>Unit Price</span><span>UOM</span><span></span>
            </div>

            {form.items.map((item, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 80px 80px 60px 30px',
                gap:'0.5rem', marginBottom:'0.5rem', alignItems:'center' }}>
                <select value={item.material} onChange={e=>updateItem(i,'material',e.target.value)} style={{...inputStyle, padding:'6px 8px'}}>
                  {MATERIALS.map(m=><option key={m.id} value={m.id}>{m.id} · {m.name}</option>)}
                </select>
                <input value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} style={{...inputStyle, padding:'6px 8px'}} />
                <input type="number" min={1} value={item.quantity} onChange={e=>updateItem(i,'quantity',e.target.value)} style={{...inputStyle, padding:'6px 8px'}} />
                <input type="number" min={0} value={item.unitPrice} onChange={e=>updateItem(i,'unitPrice',e.target.value)} style={{...inputStyle, padding:'6px 8px'}} />
                <input value={item.uom} onChange={e=>updateItem(i,'uom',e.target.value)} style={{...inputStyle, padding:'6px 8px'}} />
                {form.items.length>1 ? (
                  <button onClick={()=>removeItem(i)} style={{ background:'none', border:'none', color:'var(--accent-red)', cursor:'pointer', fontSize:'1rem', padding:0 }}>×</button>
                ) : <div/>}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            borderTop:'1px solid var(--border)', paddingTop:'1rem' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>
              <span style={{ color:'var(--text-secondary)' }}>TOTAL ORDER VALUE: </span>
              <span style={{ color:'var(--accent-green)', fontWeight:700, fontSize:'1rem' }}>
                ₹{totalValue.toLocaleString('en-IN')} INR
              </span>
            </div>
            <button onClick={handleSubmit} disabled={submitting || !form.customerId || !form.requestedDate}
              style={{
                padding:'10px 28px', background:'var(--accent-blue)', color:'white',
                border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer',
                fontSize:'0.85rem', fontWeight:700,
                opacity: (submitting || !form.customerId || !form.requestedDate) ? 0.5 : 1,
              }}>
              {submitting ? 'Creating...' : '⚡ Create Sales Order'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
