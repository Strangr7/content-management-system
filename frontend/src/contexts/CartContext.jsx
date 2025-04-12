import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    const response = await fetch('/api/cart', {
      credentials: 'include'
    });
    const data = await response.json();
    setCartItems(data.items);
  };

  const addToCart = async (productId, quantity = 1) => {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
      credentials: 'include'
    });
    const data = await response.json();
    setCartItems(data.items);
    return data;
  };

  const removeFromCart = async (productId) => {
    const response = await fetch(`/api/cart/${productId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await response.json();
    setCartItems(data.items);
    return data;
  };

  const updateQuantity = async (productId, quantity) => {
    const response = await fetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
      credentials: 'include'
    });
    const data = await response.json();
    setCartItems(data.items);
    return data;
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity), 0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};