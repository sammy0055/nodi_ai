import { useEffect, useRef, useState } from 'react';
import { OrderService, type GetOrderParams } from '../services/orderService';
import type { OrderStatus } from '../pages/tenant/OrderPage';
import { useOrdersSetRecoilState, useUserValue } from '../store/authAtoms';

interface Arguments {
  setPagination?: any;
  setOrderStats?: any;
  isAdmin?: boolean;
}
export const useGetOrdersOnInterval = (
  response: any,
  orderStatus?: OrderStatus | 'all' | 'new' | 'assigned',
  args?: Arguments
) => {
  const intervalRef = useRef<number | null>(null);
  const [dataset, setDataSet] = useState<any>({});
  const setOrders = useOrdersSetRecoilState();
  const currentUser = useUserValue();
  const { getOrders, getOrderStatsPerAsignedUser } = new OrderService();

  useEffect(() => {
    const getOrderOnInterval = async () => {
      try {
        const filter: GetOrderParams = {};
        if (orderStatus && orderStatus !== 'all' && orderStatus !== 'new' && orderStatus !== 'assigned') {
          filter.status = orderStatus;
        }

        const data = await getOrders(filter);
        if (currentUser?.id) {
          const stats = await getOrderStatsPerAsignedUser(currentUser.id);
          args?.setOrderStats(stats.data);
        } 
        
        if(args?.isAdmin){
          const stats = await getOrderStatsPerAsignedUser();
          args?.setOrderStats(stats.data);
        }

        setOrders(data.data.data);
        if (args?.setPagination) args.setPagination(data.data.pagination);
        setDataSet({ ...response, orders: data.data });
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Run immediately
    getOrderOnInterval();

    // Start polling with latest orderStatus
    intervalRef.current = window.setInterval(getOrderOnInterval, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderStatus]); // 👈 important

  return { dataset };
};
