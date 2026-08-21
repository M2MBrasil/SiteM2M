'use client';

import React from 'react';
import { Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatBRL } from '@/lib/formatters';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

export function ProductCard({ product, onSelect, onQuickAdd }: ProductCardProps) {
  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';

  const isPromo = product.promotionalPrice && product.promotionalPrice < product.price;
  const currentPrice = isPromo ? product.promotionalPrice : product.price;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col rounded-2xl bg-slate-900/90 border border-blue-950/80 hover:border-blue-500/50 shadow-lg hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 overflow-hidden"
    >
      {/* Product Image Stage */}
      <div
        onClick={() => onSelect(product)}
        className="relative w-full pt-[90%] bg-slate-950 overflow-hidden cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/40">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              Destaque
            </span>
          )}
          {isPromo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md">
              Promoção
            </span>
          )}
        </div>

        {/* Category tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-[11px] font-semibold text-blue-200/90 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-blue-900/40">
            {product.categoryName || 'Personalizado'}
          </span>
        </div>

        {/* Quick View Hover action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/40 backdrop-blur-[2px] transition-all duration-300">
          <span className="px-4 py-2 rounded-xl bg-blue-600/90 text-white text-xs font-bold shadow-lg flex items-center gap-2 border border-blue-400/40">
            <Eye className="w-3.5 h-3.5" />
            Personalizar
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => onSelect(product)}
            className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-300 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Color swatches preview */}
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-medium">Cores:</span>
            <div className="flex items-center gap-1">
              {product.availableColors.slice(0, 5).map((color) => (
                <span
                  key={color.id}
                  className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {product.availableColors.length > 5 && (
                <span className="text-[10px] text-slate-400">+{product.availableColors.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {/* Price & Call to Action */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">A partir de</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-blue-300">
                {formatBRL(currentPrice)}
              </span>
              {isPromo && (
                <span className="text-xs text-slate-500 line-through">
                  {formatBRL(product.price)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(product)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 flex items-center gap-1.5 transition-all border border-blue-400/30"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ver Produto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
