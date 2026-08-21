'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { Category, Color, Product, Size } from '@/lib/types';
import { ProductCard } from '@/components/common/ProductCard';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  colors: Color[];
  sizes: Size[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  onSelectProduct: (product: Product) => void;
}

export function CatalogView({
  products,
  categories,
  colors,
  sizes,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct,
}: CatalogViewProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [onlyPromotions, setOnlyPromotions] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'name'>('relevance');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;

      // Category filter
      if (selectedCategory && p.categoryId !== selectedCategory) {
        return false;
      }

      // Promotions only
      if (onlyPromotions && !p.isPromotion) {
        return false;
      }

      // Color filter
      if (selectedColorId) {
        const hasColor = p.availableColors?.some((c) => c.id === selectedColorId);
        if (!hasColor) return false;
      }

      // Size filter
      if (selectedSizeId) {
        const hasSize = p.availableSizes?.some((s) => s.id === selectedSizeId);
        if (!hasSize) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesCat = p.categoryName?.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesCat && !matchesDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.promotionalPrice || a.price;
      const priceB = b.promotionalPrice || b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, onlyPromotions, selectedColorId, selectedSizeId, searchQuery, sortBy]);

  const hasActiveFilters = !!(selectedCategory || selectedColorId || selectedSizeId || onlyPromotions || searchQuery);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedColorId(null);
    setSelectedSizeId(null);
    setOnlyPromotions(false);
    setSearchQuery('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Pills Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white">Catálogo de Produtos</h2>
          <span className="text-xs text-slate-400 font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400/40'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
            }`}
          >
            Todos os Produtos
          </button>
          {categories
            .filter((c) => c.active)
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-blue-900/30 flex flex-wrap items-center justify-between gap-4">
        {/* Search input and Quick Promo checkbox */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nome, código ou palavra-chave..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={onlyPromotions}
              onChange={(e) => setOnlyPromotions(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold text-amber-300">Apenas Promoções</span>
          </label>
        </div>

        {/* Color and Size Quick Dropdowns & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Color filter */}
          <select
            value={selectedColorId || ''}
            onChange={(e) => setSelectedColorId(e.target.value || null)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas as Cores</option>
            {colors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Size filter */}
          <select
            value={selectedSizeId || ''}
            onChange={(e) => setSelectedSizeId(e.target.value || null)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos os Tamanhos</option>
            {sizes.map((s) => (
              <option key={s.id} value={s.id}>
                Tam: {s.name}
              </option>
            ))}
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
          >
            <option value="relevance">Destaques Primeiro</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="name">Nome (A - Z)</option>
          </select>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="py-20 px-4 text-center rounded-3xl bg-gradient-to-b from-slate-900/60 via-blue-950/40 to-slate-900/60 border border-blue-900/40 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-xl text-white">Nenhum produto cadastrado ainda</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            O catálogo está pronto e limpo para receber os seus produtos reais. Acesse o <strong>Painel do Administrador (MauricioM2M)</strong> no topo para cadastrar suas camisetas, bonés, moletons, canecas e uniformes.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <p className="font-bold text-lg text-white">Nenhum produto encontrado</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não encontramos nenhum item com os filtros ou termo de busca selecionados. Tente alterar os termos.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg"
          >
            Ver Todos os Produtos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
          ))}
        </div>
      )}
    </section>
  );
}
