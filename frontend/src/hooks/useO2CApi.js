// hooks/useO2CApi.js
// Centralizes all axios calls to the mock SAP backend

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE = 'http://localhost:3000/api';

export function useO2CApi() {
  const [orders,   setOrders]   = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [customers,setCustomers]= useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, summaryRes, custRes] = await Promise.all([
        axios.get(`${BASE}/orders`),
        axios.get(`${BASE}/pipeline-summary`),
        axios.get(`${BASE}/customers`),
      ]);
      setOrders(ordersRes.data.d.results);
      setSummary(summaryRes.data.d);
      setCustomers(custRes.data.d.results);
    } catch (err) {
      setError(err.message || 'Failed to connect to SAP backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createOrder = async (payload) => {
    try {
      const res = await axios.post(`${BASE}/orders`, payload);
      const newOrder = res.data.d;
      setOrders(prev => [...prev, newOrder]);
      setSummary(prev => {
        if (!prev) return prev;
        const updated = prev.stages.map(s =>
          s.stage === 'ORDER_CREATED'
            ? { ...s, orderCount: s.orderCount + 1, totalValue: s.totalValue + newOrder.totalValue }
            : s
        );
        return { ...prev, stages: updated, totalOrders: prev.totalOrders + 1, grandTotalValue: prev.grandTotalValue + newOrder.totalValue };
      });
      showToast(`✓ Order ${newOrder.orderId} created successfully`);
      return newOrder;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      showToast(`✗ ${msg}`, 'error');
      throw err;
    }
  };

  const advanceStatus = async (orderId) => {
    try {
      const res = await axios.put(`${BASE}/orders/${orderId}/status`);
      const updated = res.data.d;
      setOrders(prev => prev.map(o => o.orderId === orderId ? updated : o));
      showToast(`✓ ${orderId} → ${updated.statusLabel}`);
      // refresh summary KPIs
      const summaryRes = await axios.get(`${BASE}/pipeline-summary`);
      setSummary(summaryRes.data.d);
      return updated;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      showToast(`✗ ${msg}`, 'error');
      throw err;
    }
  };

  return { orders, summary, customers, loading, error, toast, createOrder, advanceStatus, refetch: fetchAll };
}
