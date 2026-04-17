// components/Toast.jsx
import React from 'react';

export default function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div style={{
      position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999,
      background: isError ? '#2a0a0a' : '#0a1f12',
      border:`1px solid ${isError ? 'var(--accent-red)' : 'var(--accent-green)'}`,
      color: isError ? 'var(--accent-red)' : 'var(--accent-green)',
      borderRadius:'var(--radius-md)', padding:'0.75rem 1.25rem',
      fontFamily:'var(--font-mono)', fontSize:'0.82rem',
      boxShadow:`0 4px 24px ${isError ? 'rgba(255,77,77,0.2)' : 'rgba(0,229,160,0.2)'}`,
      animation:'toastIn 0.25s ease',
      maxWidth:'380px',
    }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {toast.msg}
    </div>
  );
}
