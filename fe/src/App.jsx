import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { store } from "./store/store";
import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModal";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/layout/Header";
import HomePage from "./pages/HomePage";

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { isAuthenticated, fetchCurrentUser, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchCurrentUser().catch(() => {
        // Error handled in redux
      });
    }
  }, [isAuthenticated, user, fetchCurrentUser]);

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    fetchCurrentUser();
  };

  const handleRegisterSuccess = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <>
      <Header
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={() => {}}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onRegisterClick={() => setIsRegisterModalOpen(true)}
      />

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
      <AppContent />
    </Provider>
  );
}
