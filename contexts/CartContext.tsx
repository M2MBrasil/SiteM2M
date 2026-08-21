'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Color, CustomizationDetails, Product, Size } from '@/lib/types';
import { getCompanySettings } from '@/lib/storage';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    options?: {
      color?: Color;
      size?: Size;
      quantity?: number;
      customization?: CustomizationDetails;
    }
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'm2m_cart_items_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);


  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to storage', e);
    }
  }, [items]);

  const addItem = (
    product: Product,
    options?: {
      color?: Color;
      size?: Size;
      quantity?: number;
      customization?: CustomizationDetails;
    }
  ) => {
    const qty = Math.max(1, options?.quantity || 1);
    const unitPrice = product.promotionalPrice && product.promotionalPrice > 0 ? product.promotionalPrice : product.price;

    const cartItemId = `${product.id}-${options?.color?.id || 'default'}-${options?.size?.id || 'default'}-${Date.now()}`;

    const newItem: CartItem = {
      cartItemId,
      product,
      selectedColor: options?.color,
      selectedSize: options?.size,
      quantity: qty,
      unitPrice,
      customization: options?.customization,
    };

    setItems((prev) => [...prev, newItem]);
    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [items]);

  const settings = useMemo(() => {
    return getCompanySettings();
  }, []);

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    if (settings.freeShippingEnabled && settings.minOrderValueForFreeShipping && subtotal >= settings.minOrderValueForFreeShipping) {
      return 0;
    }
    return settings.deliveryFeeDefault || 18.0;
  }, [items.length, settings, subtotal]);

  const discount = useMemo(() => {
    return couponDiscount;
  }, [couponDiscount]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shipping);
  }, [subtotal, discount, shipping]);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'M2M10') {
      const disc = subtotal * 0.1;
      setCouponDiscount(disc);
      setAppliedCoupon('M2M10 (10% OFF)');
      return { success: true, message: 'Cupom de 10% aplicado com sucesso!' };
    }
    if (clean === 'PRIMEIRACOMPRA') {
      const disc = 15.0;
      setCouponDiscount(disc);
      setAppliedCoupon('PRIMEIRACOMPRA (R$ 15 OFF)');
      return { success: true, message: 'Desconto de R$ 15,00 aplicado!' };
    }
    return { success: false, message: 'Cupom inválido ou expirado.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        discount,
        shipping,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
