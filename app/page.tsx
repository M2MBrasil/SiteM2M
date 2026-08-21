'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { CartDrawer } from '@/components/common/CartDrawer';
import { WhatsAppFloating } from '@/components/common/WhatsAppFloating';
import { StoreHero } from '@/components/customer/StoreHero';
import { CatalogView } from '@/components/customer/CatalogView';
import { ProductDetailModal } from '@/components/customer/ProductDetailModal';
import { QuickQuoteModal } from '@/components/common/QuickQuoteModal';
import { AuthModal } from '@/components/customer/AuthModal';
import { CheckoutView } from '@/components/customer/CheckoutView';
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import {
  getProducts,
  getCategories,
  getColors,
  getSizes,
} from '@/lib/storage';
import { Order, Product } from '@/lib/types';

function MainApp() {
  // Navigation View State: 'store' | 'checkout' | 'account' | 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'checkout' | 'account' | 'admin'>('store');
  const [customerTab, setCustomerTab] = useState<'orders' | 'quotes' | 'profile'>('orders');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('login');

  // Database lists with lazy initializers
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [categories, setCategories] = useState<any[]>(() => getCategories());
  const [colors, setColors] = useState<any[]>(() => getColors());
  const [sizes, setSizes] = useState<any[]>(() => getSizes());

  const reloadData = () => {
    setProducts(getProducts());
    setCategories(getCategories());
    setColors(getColors());
    setSizes(getSizes());
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDirectQuoteFromModal = (product: Product, options: any) => {
    setQuoteProduct(product);
    setIsQuoteModalOpen(true);
  };

  const handleCategorySelectFromHero = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Smooth scroll down to catalog
    window.scrollTo({ top: 520, behavior: 'smooth' });
  };

  const handleOpenAuth = (tab: 'login' | 'register' | 'admin' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view: 'store' | 'checkout' | 'account' | 'admin') => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (currentView !== 'store') {
            setCurrentView('store');
          }
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onRequestQuote={() => {
          setQuoteProduct(null);
          setIsQuoteModalOpen(true);
        }}
        onOpenLogin={() => handleOpenAuth('login')}
        onOpenQuoteModal={() => {
          setQuoteProduct(null);
          setIsQuoteModalOpen(true);
        }}
      />


      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {/* VIEW 1: E-COMMERCE STORE FRONT */}
        {currentView === 'store' && (
          <div>
            <StoreHero
              onExploreCatalog={() => {
                window.scrollTo({ top: 520, behavior: 'smooth' });
              }}
              onSelectCategory={handleCategorySelectFromHero}
            />

            <CatalogView
              products={products}
              categories={categories}
              colors={colors}
              sizes={sizes}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectProduct={handleSelectProduct}
            />
          </div>
        )}

        {/* VIEW 2: 5-STEP CHECKOUT */}
        {currentView === 'checkout' && (
          <CheckoutView
            onBackToStore={() => setCurrentView('store')}
            onOrderSuccess={(order: Order) => {
              // Redirect to customer orders after a brief delay or let user choose
            }}
          />
        )}

        {/* VIEW 3: CUSTOMER PORTAL ("MINHA CONTA") */}
        {currentView === 'account' && (
          <CustomerDashboard
            initialTab={customerTab}
            onExploreProducts={() => setCurrentView('store')}
          />
        )}

        {/* VIEW 4: ADMIN DASHBOARD (10 MODULES) */}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Universal Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRequestQuote={() => {
          setQuoteProduct(null);
          setIsQuoteModalOpen(true);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer onCheckout={() => setCurrentView('checkout')} />

      {/* Floating WhatsApp Widget */}
      <WhatsAppFloating />

      {/* Product Detail & Customization Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onRequestQuoteDirect={handleDirectQuoteFromModal}
        />
      )}

      {/* Quick Quote Request Modal */}
      <QuickQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        preSelectedProduct={quoteProduct}
      />

      {/* Unified Authentication & Admin Access Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onSuccessNavigate={(targetView) => {
          setCurrentView(targetView);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
