import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product_id === action.item.product_id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.product_id === action.item.product_id
              ? { ...i, quantity: Math.min(i.quantity + action.item.quantity, 10) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.product_id !== action.product_id) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.product_id === action.product_id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_DRAWER':
      return { ...state, isOpen: true };
    case 'CLOSE_DRAWER':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

const INITIAL_STATE = { items: [], isOpen: false };

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE, (init) => {
    try {
      const saved = localStorage.getItem('fh_cart');
      return saved ? { ...init, items: JSON.parse(saved) } : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem('fh_cart', JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  function addItem(item) {
    dispatch({ type: 'ADD_ITEM', item });
    dispatch({ type: 'OPEN_DRAWER' });
  }

  function removeItem(product_id) { dispatch({ type: 'REMOVE_ITEM', product_id }); }
  function updateQty(product_id, quantity) {
    if (quantity < 1) return removeItem(product_id);
    dispatch({ type: 'UPDATE_QTY', product_id, quantity });
  }
  function clearCart() { dispatch({ type: 'CLEAR' }); }
  function toggleDrawer() { dispatch({ type: 'TOGGLE_DRAWER' }); }
  function closeDrawer() { dispatch({ type: 'CLOSE_DRAWER' }); }

  return (
    <CartContext.Provider value={{
      items: state.items, isOpen: state.isOpen, itemCount, subtotal,
      addItem, removeItem, updateQty, clearCart, toggleDrawer, closeDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
