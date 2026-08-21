'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Tag, Check, FileText } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatBRL } from '@/lib/formatters';

interface CartDrawerProps {
  onProceedToCheckout?: () => void;
  onCheckout?: () => void;
  onRequestQuote?: () => void;
  onOpenCatalog?: () => void;
}

export function CartDrawer({
  onProceedToCheckout,
  onCheckout,
  onRequestQuote,
  onOpenCatalog,
}: CartDrawerProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    if (onCheckout) onCheckout();
    else if (onProceedToCheckout) onProceedToCheckout();
  };


  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-blue-900/40 text-slate-100 flex flex-col shadow-2xl">
          {/* Top Bar */}
          <div className="p-5 border-b border-blue-900/30 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Meu Carrinho</h3>
                <p className="text-xs text-slate-400">
                  {items.length} {items.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar Carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-base text-white">Seu carrinho está vazio</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Explore nossos produtos personalizados e crie peças exclusivas para você ou sua empresa.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    if (onOpenCatalog) onOpenCatalog();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-blue-900/30"
                >
                  Explorar Catálogo de Produtos
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-blue-900/30 space-y-3 relative group hover:border-blue-700/50 transition-all"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-xs text-white line-clamp-1">{item.product.name}</h4>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                          title="Remover produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        {item.selectedColor && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            <span
                              className="w-2 h-2 rounded-full border border-white/40"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                            Tam: {item.selectedSize.name}
                          </span>
                        )}
                      </div>

                      {/* Customization tag preview */}
                      {item.customization && (item.customization.customText || item.customization.placement) && (
                        <div className="mt-1.5 text-[10px] bg-blue-950/60 border border-blue-800/40 p-1.5 rounded-lg text-blue-200">
                          {item.customization.customText && (
                            <p className="truncate">
                              <span className="text-slate-400">Texto:</span> &quot;{item.customization.customText}&quot;
                            </p>
                          )}
                          {item.customization.placement && (
                            <p>
                              <span className="text-slate-400">Posição:</span> {item.customization.placement}
                            </p>
                          )}
                          {item.customization.artFileName && (
                            <p className="text-emerald-400 truncate">
                              ✓ Arte anexada: {item.customization.artFileName}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                        <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-blue-300">
                          {formatBRL(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Checkout / Pricing Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-blue-900/40 bg-slate-900/90 space-y-4">
              {/* Coupon form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-xs text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-400 hover:text-emerald-200 underline text-[11px]"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Cupom (ex: M2M10)"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 border border-slate-700"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1 ${
                      couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">{formatBRL(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto</span>
                    <span>- {formatBRL(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete Estimado</span>
                  <span className="font-medium text-white">
                    {shipping === 0 ? <span className="text-emerald-400 font-bold">Grátis</span> : formatBRL(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total</span>
                  <span className="text-blue-300 font-extrabold text-base">{formatBRL(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  id="cart-checkout-proceed-btn"
                  onClick={handleCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 group transition-all"
                >
                  <span>Finalizar Pedido Agora</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      if (onRequestQuote) onRequestQuote();
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-blue-900/40 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Pedir Orçamento</span>
                  </button>


                  <button
                    onClick={() => {
                      clearCart();
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors"
                  >
                    Esvaziar Carrinho
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
