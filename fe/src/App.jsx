import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
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
import UsersPage from "./pages/admin/UsersPage";
import SportTypesPage from "./pages/admin/SportTypesPage";
import CourtsPage from "./pages/admin/CourtsPage";
import TimeSlotsPage from "./pages/admin/TimeSlotsPage";

const queryClient = new QueryClient();

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
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
      {!isAdminRoute && (
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
            <HomePage
              user={user}
              isAuthenticated={isAuthenticated}
              onLoginClick={() => setIsLoginModalOpen(true)}
              onRegisterClick={() => setIsRegisterModalOpen(true)}
            />
          }
        />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="sport-types" element={<SportTypesPage />} />
            <Route path="courts" element={<CourtsPage />} />
            <Route path="time-slots" element={<TimeSlotsPage />} />
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
        onSuccess={handleLoginSuccess}
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
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}
