import { useState, useEffect } from 'react';
import { orderAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setOrders([]); setLoading(false); return; }
    fetchOrders();
  }, [user]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function getOrder(orderId) {
    const response = await orderAPI.getOne(orderId);
    return response.data;
  }

  return { orders, loading, refetch: fetchOrders, getOrder };
}
