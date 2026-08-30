import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sp_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart items', err);
      }
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sp_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size = null, quantity = 1) => {
    setCartItems((prevItems) => {
      // Find if item already exists with the same size
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.selectedSize === size
      );

      // Derive correct price (if product has sizes, use size price, else default price)
      let price = product.price;
      if (size && product.sizes) {
        const sizeData = product.sizes.find((s) => s.size === size);
        if (sizeData) price = sizeData.price;
      }

      if (existingIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [
          ...prevItems,
          {
            productId: product.id,
            productName: product.name,
            selectedSize: size,
            price,
            image: product.image,
            quantity,
            slug: product.slug,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.selectedSize === size)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal: getCartSubtotal(),
        itemCount: getCartCount(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
