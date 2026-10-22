import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Menu from './pages/Menu';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import FaveDrawer from './components/FaveDrawer';
import { FaveProvider } from './context/FaveContext';
import ProductModal from './components/ProductModal';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import { LoaderProvider } from './context/LoaderContext';
import LoaderOverlay from './components/LoaderOverlay';
import { MenuProvider } from './context/MenuContext';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CheckoutPage from './pages/CheckoutPage';
import GuestCheckoutPage from './pages/GuestCheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFaveOpen, setIsFaveOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedCategory('All');
  };

  return (
    <ToastProvider>
      <LoaderProvider>
        <AuthProvider>    
          <CartProvider>
            <FaveProvider>
              <MenuProvider> 
                <BrowserRouter>
                  <Navbar 
                  onOpenCart={() => setIsCartOpen(true)} 
                  onOpenFavorites={() => setIsFaveOpen(true)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  />

                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                      path="/menu"
                      element={
                        <Menu
                          selectedCategory={selectedCategory}
                          selectedGroup={selectedGroup}
                          onSelectCategory={setSelectedCategory}
                          onSelectGroup={handleGroupSelect}
                          onQuickView={setSelectedProduct}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                        />
                      }
                    />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/checkout/guest" element={<GuestCheckoutPage />} />
                      <Route path="/order/:id" element={<OrderConfirmationPage />} />
                      <Route path="/orders" element={<MyOrdersPage />} />
                      <Route path="/book" element={<BookingPage />} />
                      <Route path="/booking/:id" element={<BookingConfirmationPage />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="*" element={<NotFoundPage />} />
                  </Routes>

                  <Footer />

                  <CartDrawer
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                  />
                  <FaveDrawer isOpen={isFaveOpen}  onClose={() => setIsFaveOpen(false)}/>
                  <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                  />
                  <ToastContainer />
                  <LoaderOverlay />   
                </BrowserRouter>
              </MenuProvider> 
            </FaveProvider>  
          </CartProvider>
        </AuthProvider>  
      </LoaderProvider>   
    </ToastProvider>
  );
}

export default App;