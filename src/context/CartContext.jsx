import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'velveteen_cart_v1';
const CartContext = createContext(null);

function readStoredCart() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.productId === 'string' && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

function cartSnapshot(product) {
  return {
    productId: String(product._id || product.id),
    name: product.name,
    description: product.description || '',
    image: product.image,
    category: product.category,
    price: Number(product.price),
    currency: product.currency,
    availability: product.availability,
    stock: product.stock,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Checkout still works for the current page session if browser storage is disabled.
    }
  }, [items]);

  const addItem = (product, amount = 1) => {
    const productId = String(product?._id || product?.id || '');
    const quantity = Math.max(1, Math.floor(Number(amount) || 1));
    if (!productId || !Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
      return { ok: false, message: 'This product is not ready to order yet.' };
    }
    if (product.availability === 'unavailable' || (Number.isFinite(product.stock) && product.stock < 1)) {
      return { ok: false, message: 'This piece is not currently available.' };
    }
    const existing = items.find((item) => item.productId === productId);
    const nextQuantity = (existing?.quantity || 0) + quantity;
    if (Number.isFinite(product.stock) && nextQuantity > product.stock) {
      return { ok: false, message: `Only ${product.stock} are currently available.` };
    }
    setItems((current) => {
      const found = current.find((item) => item.productId === productId);
      const snapshot = cartSnapshot(product);
      return found
        ? current.map((item) => item.productId === productId ? { ...item, ...snapshot, quantity: item.quantity + quantity } : item)
        : [...current, { ...snapshot, quantity }];
    });
    return { ok: true, message: `${product.name} added to your bag.` };
  };

  const updateQuantity = (productId, amount) => {
    const quantity = Math.floor(Number(amount));
    const existing = items.find((item) => item.productId === productId);
    if (!existing) return { ok: false, message: 'That product is no longer in your bag.' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return { ok: false, message: 'Choose a quantity from 1 to 99.' };
    if (Number.isFinite(existing.stock) && quantity > existing.stock) return { ok: false, message: `Only ${existing.stock} are currently available.` };
    setItems((current) => current.map((item) => item.productId === productId ? { ...item, quantity } : item));
    return { ok: true };
  };

  const removeItem = (productId) => setItems((current) => current.filter((item) => item.productId !== productId));
  const clearCart = () => setItems([]);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = useMemo(() => ({ items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart }), [items, itemCount, subtotal]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
