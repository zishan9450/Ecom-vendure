import { useActiveOrder } from './use-active-order';
import { Order } from '~/generated/graphql';

export function useCart() {
  const { activeOrder, adjustOrderLine, removeItem } = useActiveOrder();

  return {
    activeOrder: activeOrder as Order | undefined,
    adjustOrderLine,
    removeItem,
  };
} 