import "./App.css"
import { Web3Provider } from './contexts/Web3Context.js';
import { AuthProvider, ROLES } from './contexts/AuthContext.js';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './components/Landing';
import FarmerDashboard from './components/farmers/Dashboard';
import Marketplace from './components/buyer/Marketplace';
import FarmerRegistration from './components/farmers/Registration';
import AboutUs from './components/AboutUs';
import ErrorBoundary from './components/ErrorBoundary.js';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelector from './components/auth/RoleSelector';
import BuyerDashboard from './components/buyer/Dashboard';
import FileDispute from './components/disputes/FileDispute';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to home if authenticated but wrong role
    return <Navigate to="/" replace />;
  }

  return children;
};

// Component to handle wallet connected users that aren't logged in
const ConnectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { account } = useWeb3();
  const location = useLocation();

  // If already authenticated, proceed to the intended destination
  if (isAuthenticated) {
    return children;
  }

  // If wallet is connected but not authenticated, redirect to role selector
  if (account && !isAuthenticated) {
    return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  // If no wallet is connected, redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <AuthProvider>
          <ToastContainer position="top-right" autoClose={5000} />
          <Header />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/select-role" element={<RoleSelector />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-farmer" element={<FarmerRegistration />} />
              <Route path="/farmer" element={
                <ProtectedRoute requiredRole={ROLES.FARMER}>
                  <FarmerDashboard/>
                </ProtectedRoute>
              } />
              <Route path="/marketplace" element={
                <ConnectedRoute>
                  <ErrorBoundary>
                    <Marketplace />
                  </ErrorBoundary>
                </ConnectedRoute>
              } />
              <Route path="/buyer-dashboard" element={
                <ProtectedRoute requiredRole={ROLES.BUYER}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <Navigate to="/buyer-dashboard" replace />
              } />
              <Route path="/dispute/:orderId" element={
                <ProtectedRoute requiredRole={ROLES.BUYER}>
                  <ErrorBoundary>
                    <FileDispute />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </Web3Provider>
  );
}

export default App;