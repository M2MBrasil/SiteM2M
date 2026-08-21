'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Check,
  Sparkles,
  ShoppingBag,
  FileText,
  ShieldCheck,
  Truck,
  Layers,
  HelpCircle,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { Color, CustomizationDetails, Product, Size } from '@/lib/types';
import { formatBRL } from '@/lib/formatters';
import { useCart } from '@/contexts/CartContext';
import { useNotification } from '@/contexts/NotificationContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onRequestQuoteDirect?: (product: Product, options: any) => void;
}

export function ProductDetailModal({ product, onClose, onRequestQuoteDirect }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<Color | undefined>(
    product?.availableColors?.[0]
  );
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(
    product?.availableSizes?.[0]
  );
  const [quantity, setQuantity] = useState<number>(product?.minQuantity || 1);

  // Customization fields
  const [customText, setCustomText] = useState('');
  const [fontFamily, setFontFamily] = useState('Impact, sans-serif');
  const [placement, setPlacement] = useState<string>('Frente');
  const [notes, setNotes] = useState('');
  const [artPreview, setArtPreview] = useState<string | null>(null);
  const [artFileName, setArtFileName] = useState<string | null>(null);

  if (!product) return null;

  const currentPrice =
    product.promotionalPrice && product.promotionalPrice < product.price
      ? product.promotionalPrice
      : product.price;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Arquivo muito pesado', 'O tamanho máximo do arquivo é 10MB.');
      return;
    }

    setArtFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setArtPreview(event.target?.result as string);
      showToast('success', 'Arte carregada com sucesso!', `Arquivo: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = () => {
    const customization: CustomizationDetails = {
      customText: customText.trim() || undefined,
      fontFamily,
      placement,
      notes: notes.trim() || undefined,
      artFileUrl: artPreview || undefined,
      artFileName: artFileName || undefined,
    };

    addItem(product, {
      color: selectedColor,
      size: selectedSize,
      quantity,
      customization,
    });

    showToast(
      'success',
      'Adicionado ao Carrinho!',
      `${quantity}x ${product.name} (${selectedColor?.name || ''} / ${selectedSize?.name || ''})`
    );
    onClose();
  };

  const handleDirectQuote = () => {
    if (onRequestQuoteDirect) {
      onRequestQuoteDirect(product, {
        color: selectedColor,
        size: selectedSize,
        quantity,
        customization: {
          customText,
          placement,
          notes,
          artFileUrl: artPreview,
          artFileName,
        },
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-blue-800/40 rounded-3xl shadow-2xl text-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b border-blue-900/30 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 uppercase tracking-wide">
              {product.code}
            </span>
            <span className="text-xs text-slate-400">• {product.categoryName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Gallery & Interactive Mockup Preview */}
          <div className="lg:col-span-6 space-y-4">
            {/* Visualizer Stage */}
            <div className="relative aspect-square rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center group">
              {/* Product base image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[selectedImageIdx]?.url || product.images[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Color tint filter simulation if applicable */}
              {selectedColor && (
                <div
                  className="absolute inset-0 mix-blend-color opacity-25 pointer-events-none transition-colors"
                  style={{ backgroundColor: selectedColor.hex }}
                />
              )}

              {/* Live Overlay simulation of Art / Text */}
              {(artPreview || customText) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8 z-20">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-blue-400/50 backdrop-blur-xs flex flex-col items-center text-center max-w-[70%] shadow-2xl animate-in zoom-in-95">
                    {artPreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={artPreview}
                        alt="Prévia da Arte"
                        className="max-h-24 max-w-full object-contain mb-1.5 rounded"
                      />
                    )}
                    {customText && (
                      <p
                        className="text-white font-extrabold text-sm sm:text-base tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        style={{ fontFamily }}
                      >
                        {customText}
                      </p>
                    )}
                    <span className="text-[10px] text-blue-300 font-semibold mt-1">
                      Posição: {placement}
                    </span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-slate-300 border border-slate-700">
                Simulação M2MBrasil
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIdx === idx
                        ? 'border-blue-500 shadow-md shadow-blue-900/50 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs & Features Mini-box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Garantia de Qualidade M2MBrasil</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Estampas produzidas com tintas originais de alta fixação. Não desbota nem descasca após lavagens industriais.
              </p>
            </div>
          </div>

          {/* Right Column: Customization Controls & Actions */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {product.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price block */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Preço Unitário</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-blue-300">{formatBRL(currentPrice)}</span>
                  {product.promotionalPrice && product.promotionalPrice < product.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatBRL(product.price)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Total Estimado</span>
                <span className="text-lg font-bold text-white">
                  {formatBRL(currentPrice * quantity)}
                </span>
              </div>
            </div>

            {/* Step 1: Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">1. Escolha a Cor:</span>
                  <span className="text-blue-300 font-semibold">{selectedColor?.name || 'Selecione'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        selectedColor?.id === color.id
                          ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">2. Escolha o Tamanho:</span>
                  <span className="text-blue-300 font-semibold">{selectedSize?.name || 'Selecione'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedSize?.id === size.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Customization (Text, Placement & File Upload) */}
            {product.allowCustomization && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-900/40 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>3. Personalize com sua Marca / Ideia:</span>
                </div>

                {/* Placement Options */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    Posição da Estampa / Bordado:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    {['Frente', 'Costas', 'Peito Esquerdo', 'Manga'].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPlacement(pos)}
                        className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                          placement === pos
                            ? 'bg-blue-600 border-blue-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Text */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    Texto / Nome / Frase (Opcional):
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Ex: SILVEIRA RUNNERS 2026"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Upload Logo / File */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    Envie seu Logo ou Arte (PNG, JPG, PDF):
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {artFileName ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-200 truncate">{artFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setArtPreview(null);
                          setArtFileName(null);
                        }}
                        className="text-rose-400 hover:text-rose-200 p-1"
                        title="Remover arquivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed border-blue-700/60 text-xs font-semibold text-blue-300 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Clique para Anexar sua Arte/Logo</span>
                    </button>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    Observações Especiais para a Produção:
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Ex: Quero o logo pequeno no peito e a estampa grande nas costas..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Quantity and CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Quantidade:</span>
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(product.minQuantity || 1, quantity - 1))}
                    className="text-slate-400 hover:text-white font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-sm text-white px-2">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-slate-400 hover:text-white font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 border border-blue-400/40 transition-all hover:scale-[1.02]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar ao Carrinho</span>
                </button>

                <button
                  onClick={handleDirectQuote}
                  className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-blue-700/50 text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Solicitar Orçamento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
