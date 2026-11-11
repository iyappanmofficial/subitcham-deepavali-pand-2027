import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { AdminDashboard } from '@/pages/dashboard/AdminDashboard';
import { CustomerList } from '@/pages/customers/CustomerList';
import { SchemeManagement } from '@/pages/schemes/SchemeManagement';
import { PaymentList } from '@/pages/payments/PaymentList';
import { PenaltyManagement } from '@/pages/penalties/PenaltyManagement';
import { ProductList } from '@/pages/products/ProductList';
import { DeepavaliPackageManagement } from '@/pages/packages/DeepavaliPackageManagement';
import { ExpenseList } from '@/pages/expenses/ExpenseList';
import { ReportCenter } from '@/pages/reports/ReportCenter';
import { CustomerPortalDashboard } from '@/pages/portal/CustomerPortalDashboard';
import { BusinessSettingsPage } from '@/pages/settings/BusinessSettings';
import { TestRunnerPage } from '@/pages/testing/TestRunnerPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

const ProtectedRoutes: React.FC = () => {
  const { currentUser, isCustomer } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If customer role, redirect root to /portal
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={isCustomer ? <CustomerPortalDashboard /> : <AdminDashboard />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/schemes" element={<SchemeManagement />} />
        <Route path="/payments" element={<PaymentList />} />
        <Route path="/penalties" element={<PenaltyManagement />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/packages" element={<DeepavaliPackageManagement />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/reports" element={<ReportCenter />} />
        <Route path="/tests" element={<TestRunnerPage />} />
        <Route path="/settings" element={<BusinessSettingsPage />} />
        
        {/* Customer Portal */}
        <Route path="/portal" element={<CustomerPortalDashboard />} />
        <Route path="/portal/*" element={<CustomerPortalDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
