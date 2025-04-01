
import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Loading from '@/components/Loading';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
const Home = lazy(() => import('@/pages/Home'));
const TokenInfo = lazy(() => import('@/pages/TokenInfo'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DashboardHome = lazy(() => import('@/pages/Dashboard/Home'));
const Payments = lazy(() => import('@/pages/Dashboard/Payments'));
const Transactions = lazy(() => import('@/pages/Dashboard/Transactions'));
const KYCVerification = lazy(() => import('@/pages/Dashboard/KYCVerification'));
const Documents = lazy(() => import('@/pages/Dashboard/Documents'));
const Profile = lazy(() => import('@/pages/Dashboard/Profile'));
const Login = lazy(() => import('@/pages/Auth/Login'));
const Register = lazy(() => import('@/pages/Auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/Auth/ResetPassword'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'));
const AdminUsers = lazy(() => import('@/pages/Admin/Users'));
const AdminKycPage = lazy(() => import('@/pages/Admin/KYCVerifications'));
const AdminTransactionsPage = lazy(() => import('@/pages/Admin/Transactions'));
const AdminHighValueApprovalsPage = lazy(() => import('@/pages/Admin/HighValueApprovals'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Create a new QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/token-info', element: <TokenInfo /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    path: '/dashboard',
    element: <Dashboard />,
    children: [
      { path: '', element: <DashboardHome /> },
      { path: 'payments', element: <Payments /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'kyc', element: <KYCVerification /> },
      { path: 'documents', element: <Documents /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  {
    path: '/admin',
    element: <Admin />,
    children: [
      { path: '', element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'kyc-verifications', element: <AdminKycPage /> },
      { path: 'transactions', element: <AdminTransactionsPage /> },
      { path: 'high-value-approvals', element: <AdminHighValueApprovalsPage /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
