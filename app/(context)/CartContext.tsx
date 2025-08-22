import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  clearCart: () => void; // Added clearCart to the type
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    console.log(`'${product.name}' added to cart!`);
  };

  // Function to completely remove an item from the cart
  const removeFromCart = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
    console.log(`Product ID ${productId} removed from cart!`);
  };

  const incrementQuantity = (productId: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (productId: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevItems.filter(item => item.id !== productId);
    });
  };

  // Function to clear all items from the cart
  const clearCart = () => {
    setItems([]);
    console.log('Cart cleared!');
  };

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
