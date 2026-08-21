'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Customer, User, UserRole } from '@/lib/types';
import { getCustomers, getUsers, saveCustomer, saveUser, addActivityLog } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  role: UserRole | null;
  isAdmin: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  registerCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    cpfCnpj?: string;
    zipCode?: string;
    address?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleDemo: (targetRole: 'admin' | 'customer' | 'guest') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'm2m_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const allUsers = getUsers();
        return allUsers.find((u) => u.id === parsed.id || u.email === parsed.email) || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [customer, setCustomer] = useState<Customer | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const allUsers = getUsers();
        const found = allUsers.find((u) => u.id === parsed.id || u.email === parsed.email);
        if (found && found.role === 'customer') {
          const allCusts = getCustomers();
          return allCusts.find((c) => c.userId === found.id || c.email === found.email) || null;
        }
      }
    } catch {
      return null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadCurrentSession = useCallback(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const allUsers = getUsers();
        const found = allUsers.find((u) => u.id === parsed.id || u.email === parsed.email);
        if (found) {
          setUser(found);
          if (found.role === 'customer') {
            const allCusts = getCustomers();
            const cust = allCusts.find((c) => c.userId === found.id || c.email === found.email);
            if (cust) setCustomer(cust);
          }
        }
      }
    } catch (e) {
      console.warn('Could not restore auth session', e);
    }
  }, []);


  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    try {
      const allUsers = getUsers();
      const cleanIdentifier = identifier.trim();
      const lower = cleanIdentifier.toLowerCase();

      // Check if trying to login as the exclusive Administrator (MauricioM2M)
      const isAdminLogin =
        lower === 'mauriciom2m' ||
        lower === 'mauricio' ||
        lower === 'admin' ||
        lower === 'admin@m2mbrasil.com.br' ||
        lower === 'mauricio.mastorillo2@gmail.com';

      if (isAdminLogin) {
        if (!password || password !== '78645524') {
          setIsLoading(false);
          return {
            success: false,
            error: 'Senha de administrador incorreta! Acesso restrito exclusivamente a MauricioM2M.',
          };
        }

        const adminUser: User = {
          id: 'usr-admin-mauricio',
          name: 'Maurício Mastorillo (Admin)',
          email: 'MauricioM2M',
          password: '78645524',
          role: 'admin',
          phone: '(15) 99601-9227',
          createdAt: '2026-01-01T00:00:00.000Z',
        };

        setUser(adminUser);
        setCustomer(null);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(adminUser));

        addActivityLog(
          'Login Admin Autorizado',
          'Administrador MauricioM2M acessou o painel de gestão',
          'auth',
          adminUser.id,
          adminUser.name,
          adminUser.id
        );

        setIsLoading(false);
        return { success: true, role: 'admin' as UserRole };
      }

      // Customer Login lookup
      const foundUser = allUsers.find(
        (u) => u.email.toLowerCase() === lower || u.name.toLowerCase() === lower
      );

      if (!foundUser) {
        setIsLoading(false);
        return { success: false, error: 'Usuário ou e-mail de cliente não encontrado no sistema.' };
      }

      if (foundUser.role === 'admin') {
        // Enforce the strict password check for admin
        if (!password || password !== '78645524') {
          setIsLoading(false);
          return { success: false, error: 'Acesso restrito. Senha de administrador inválida.' };
        }
      } else if (password && foundUser.password && foundUser.password !== password) {
        setIsLoading(false);
        return { success: false, error: 'Senha de cliente incorreta. Tente novamente.' };
      }

      setUser(foundUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(foundUser));

      if (foundUser.role === 'customer') {
        const allCusts = getCustomers();
        const cust = allCusts.find((c) => c.userId === foundUser.id || c.email.toLowerCase() === lower);
        if (cust) setCustomer(cust);
      } else {
        setCustomer(null);
      }

      addActivityLog(
        'Login efetuado',
        `Usuário ${foundUser.name} (${foundUser.role}) efetuou login`,
        'auth',
        foundUser.id,
        foundUser.name,
        foundUser.id
      );

      setIsLoading(false);
      return { success: true, role: foundUser.role as UserRole };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Erro no processo de autenticação.' };
    }
  };

  const registerCustomer = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    cpfCnpj?: string;
    zipCode?: string;
    address?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  }) => {
    setIsLoading(true);
    try {
      const allUsers = getUsers();
      const normalizedEmail = data.email.trim().toLowerCase();
      if (allUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        setIsLoading(false);
        return { success: false, error: 'Já existe uma conta cadastrada com este e-mail.' };
      }

      const userId = `usr-cust-${Date.now()}`;
      const newUser: User = {
        id: userId,
        name: data.name,
        email: normalizedEmail,
        password: data.password || '123456',
        role: 'customer',
        phone: data.phone,
        createdAt: new Date().toISOString(),
      };
      saveUser(newUser);

      const newCustomer = saveCustomer({
        userId,
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        whatsapp: data.phone.replace(/\D/g, ''),
        cpfCnpj: data.cpfCnpj || '',
        zipCode: data.zipCode || '',
        address: data.address || '',
        number: data.number || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || 'SP',
      });

      setUser(newUser);
      setCustomer(newCustomer);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));

      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Erro ao criar cadastro de cliente.' };
    }
  };

  const logout = () => {
    setUser(null);
    setCustomer(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const switchRoleDemo = (targetRole: 'admin' | 'customer' | 'guest') => {
    if (targetRole === 'guest') {
      logout();
      return;
    }
    if (targetRole === 'admin') {
      // Admin role requires explicit password authentication with MauricioM2M and 78645524
      return;
    }
    const allUsers = getUsers();
    const targetUser = allUsers.find((u) => u.role === 'customer');
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(targetUser));
      const custs = getCustomers();
      const c = custs.find((item) => item.userId === targetUser.id || item.email === targetUser.email) || custs[0];
      setCustomer(c || null);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        role: user?.role || null,
        isAdmin,
        isCustomer,
        isLoading,
        login,
        registerCustomer,
        logout,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
