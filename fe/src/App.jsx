import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "./store/store";
import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModal";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/layout/Header";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UsersPage from "./pages/admin/UsersPage";
import SportTypesPage from "./pages/admin/SportTypesPage";
import CourtsPage from "./pages/admin/CourtsPage";
import BookingsPage from "./pages/admin/BookingsPage";
import BookingPage from "./pages/BookingPage";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentCancelPage from "./pages/payment/PaymentCancelPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChatPage from "./pages/admin/ChatPage";
import ReviewManagementPage from "./pages/admin/ReviewManagementPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ForgotPasswordModal from "./components/modals/ForgotPasswordModal";
import ChatWidget from "./components/chat/ChatWidget";
import AIChatWidget from "./components/chat/AIChatWidget";
import CourtDetailPage from "./pages/CourtDetailPage";
import EventsPage from "./pages/admin/EventsPage";
import { useTheme } from "./components/theme-provider";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const queryClient = new QueryClient();

const paypalOptions = {
  "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
};

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { isAuthenticated, fetchCurrentUser, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchCurrentUser().catch(() => {
        // Error handled in redux
      });
    }
  }, [isAuthenticated, user, fetchCurrentUser]);

  const handleLoginSuccess = async () => {
    setIsLoginModalOpen(false);
    try {
      const fetchedUser = await fetchCurrentUser();
      if (fetchedUser?.roles?.includes("ADMIN")) {
        navigate("/admin");
      }
    } catch (error) {
      // Ignore error as it's handled in redux
    }
  };

  const handleRegisterSuccess = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <>
      {!isAdminRoute && !(isAuthenticated && !user) && (
        <Header
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={() => {}}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onRegisterClick={() => setIsRegisterModalOpen(true)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && !user ? (
              <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Đang tải...</span>
              </div>
            ) : user?.roles?.includes("ADMIN") ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <HomePage
                user={user}
                isAuthenticated={isAuthenticated}
                onLoginClick={() => setIsLoginModalOpen(true)}
                onRegisterClick={() => setIsRegisterModalOpen(true)}
              />
            )
          }
        />

        <Route path="/booking" element={<BookingPage />} />
        <Route path="/court/:id" element={<CourtDetailPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProtectedRoute />}>
          <Route index element={<ProfilePage />} />
        </Route>
        <Route path="/my-bookings" element={<ProtectedRoute />}>
          <Route index element={<MyBookingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["ADMIN"]} />}
        >
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="sport-types" element={<SportTypesPage />} />
            <Route path="courts" element={<CourtsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="reviews" element={<ReviewManagementPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
        onForgotPassword={() => {
          setIsLoginModalOpen(false);
          setIsForgotPasswordOpen(true);
        }}
        onSuccess={handleLoginSuccess}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onBackToLogin={() => {
          setIsForgotPasswordOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onSuccess={handleRegisterSuccess}
      />

      {!isAdminRoute && user?.roles?.includes("ADMIN") === false && (
        <>
          <ChatWidget />
          <AIChatWidget />
        </>
      )}
      {!isAdminRoute && !user && (
        <>
          <ChatWidget />
          <AIChatWidget />
        </>
      )}
    </>
  );
}

export default function App() {
  const { theme } = useTheme();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PayPalScriptProvider options={paypalOptions}>
          <AppContent />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            theme={theme === "system" ? "light" : theme}
          />
        </PayPalScriptProvider>
      </QueryClientProvider>
    </Provider>
  );
}
