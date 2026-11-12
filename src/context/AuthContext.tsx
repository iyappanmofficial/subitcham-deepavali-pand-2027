import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { db } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'SDP_CURRENT_USER';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    // Default to Admin for full experience
    return {
      id: 'user-admin-1',
      email: 'admin@subitchampand.com',
      full_name: 'V. Ramanathan (Proprietor)',
      role: 'admin',
      phone: '+91 98401 23456',
      is_active: true,
      created_at: '2025-10-01T00:00:00+05:30',
    };
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = async (email: string, designatedRole: UserRole = 'admin'): Promise<boolean> => {
    // If Supabase configured, check Supabase
    if (isSupabaseConfigured && supabase) {
      // Will attempt supabase login or fallback
    }

    // Role-based matching
    let user: UserProfile;
    if (designatedRole === 'admin' || email.includes('admin')) {
      user = {
        id: 'user-admin-1',
        email: email || 'admin@subitchampand.com',
        full_name: 'V. Ramanathan (Proprietor)',
        role: 'admin',
        phone: '+91 98401 23456',
        is_active: true,
        created_at: '2025-10-01T00:00:00+05:30',
      };
    } else if (designatedRole === 'staff' || email.includes('staff')) {
      user = {
        id: 'user-staff-1',
        email: email || 'staff@subitchampand.com',
        full_name: 'K. Senthil Kumar (Collection Staff)',
        role: 'staff',
        phone: '+91 94441 98765',
        is_active: true,
        created_at: '2025-10-10T00:00:00+05:30',
      };
    } else {
      // Customer
      const cust = db.getCustomerByUserId('user-cust-1') || db.getCustomers()[0];
      user = {
        id: cust?.user_id || 'user-cust-1',
        email: email || 'karthik@gmail.com',
        full_name: cust?.full_name || 'S. Karthikeyan',
        role: 'customer',
        phone: cust?.mobile || '9840011223',
        is_active: true,
        created_at: '2025-11-01T00:00:00+05:30',
      };
    }

    setCurrentUser(user);
    return true;
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      setCurrentUser({
        id: 'user-admin-1',
        email: 'admin@subitchampand.com',
        full_name: 'V. Ramanathan (Admin)',
        role: 'admin',
        phone: '+91 98401 23456',
        is_active: true,
        created_at: '2025-10-01T00:00:00+05:30',
      });
    } else if (newRole === 'staff') {
      setCurrentUser({
        id: 'user-staff-1',
        email: 'staff@subitchampand.com',
        full_name: 'K. Senthil Kumar (Collection Staff)',
        role: 'staff',
        phone: '+91 94441 98765',
        is_active: true,
        created_at: '2025-10-10T00:00:00+05:30',
      });
    } else {
      const cust = db.getCustomers()[0];
      setCurrentUser({
        id: cust?.user_id || 'user-cust-1',
        email: 'customer@subitchampand.com',
        full_name: cust?.full_name || 'S. Karthikeyan (Customer)',
        role: 'customer',
        phone: cust?.mobile || '9840011223',
        is_active: true,
        created_at: '2025-11-01T00:00:00+05:30',
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const role: UserRole = currentUser?.role || 'admin';
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';
  const isCustomer = role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAdmin,
        isStaff,
        isCustomer,
        login,
        logout,
        switchRole,
        isSupabaseConnected: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

