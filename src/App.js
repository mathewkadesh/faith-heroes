import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ShareKindnessPage from './pages/ShareKindnessPage';
import ContactPage from './pages/ContactPage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import PromotionPage from './pages/PromotionPage';
import PromotionsPage from './pages/PromotionsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AccountPage from './pages/AccountPage';
import AuthPage from './pages/AuthPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Characters from './pages/admin/Characters';
import Products from './pages/admin/Products';
import Promotions from './pages/admin/Promotions';
import Stories from './pages/admin/Stories';
import Customers from './pages/admin/Customers';
import Settings from './pages/admin/Settings';

const basename = process.env.NODE_ENV === 'production' ? '/faith-heroes' : '/';

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <Cart />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/share-kindness" element={<ShareKindnessPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:characterId" element={<ProductPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/promotions/:slug" element={<PromotionPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/track-order" element={<OrderTrackingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/orders/:orderId" element={<OrderTrackingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="characters" element={<Characters />} />
          <Route path="products" element={<Products />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="stories" element={<Stories />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#180C0C',
            border: '1px solid rgba(201,168,76,0.22)',
            color: '#FDF5F0',
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
