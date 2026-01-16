import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

// localStorage dan savatni o'qish funksiyasi
const getCartFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('stomatology_cart');
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

// localStorage ga savatni saqlash funksiyasi
const saveCartToLocalStorage = (cart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('stomatology_cart', JSON.stringify(cart));
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Komponent yuklanganda localStorage dan savatni o'qish
  useEffect(() => {
    const savedCart = getCartFromLocalStorage();
    if (savedCart.length > 0) {
      setCartItems(savedCart);
    }
  }, []);

  // cartItems o'zgarganda localStorage ga saqlash
  useEffect(() => {
    if (cartItems.length > 0 || cartItems.length === 0) {
      saveCartToLocalStorage(cartItems);
    }
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const isExist = prev.find(item => item.id === product.id);
      // Narxni har doim raqamga o'girish (bo'shliqlarni olib tashlaydi)
      const cleanPrice = typeof product.narxi === 'string'
        ? parseInt(product.narxi.replace(/\s/g, ''))
        : product.narxi;

      let updatedCart;

      if (isExist) {
        updatedCart = prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...prev, {
          ...product,
          narxi: cleanPrice,
          quantity: 1,
          image: product.image || product.rasm || '/' // Tasvirni saqlash
        }];
      }

      return updatedCart;
    });
  };

  const updateQuantity = (id, amount) => {
    setCartItems(prev => {
      const updatedCart = prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      );
      return updatedCart;
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Savatni tozalash funksiyasi
  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('stomatology_cart');
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
