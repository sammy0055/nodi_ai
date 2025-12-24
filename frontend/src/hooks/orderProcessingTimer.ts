import { useEffect, useState } from 'react';
import type { IOrder } from '../pages/tenant/OrderPage';

function useProcessingTime(order: IOrder) {
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    // not started → no processing time
    if (!order?.startedAt) {
      setProcessingTime(0);
      return;
    }

    const start = new Date(order.startedAt).getTime();
    const end = order.completedAt ? new Date(order.completedAt).getTime() : Date.now();

    setProcessingTime(Math.floor((end - start) / 1000));

    if (order.completedAt) return;

    const interval = setInterval(() => {
      setProcessingTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.startedAt, order?.completedAt]);

  return processingTime;
}

export default useProcessingTime;
