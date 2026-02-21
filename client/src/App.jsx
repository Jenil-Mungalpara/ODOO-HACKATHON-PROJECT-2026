import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  const { token, loading } = useAuth();

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={token ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/vehicles" element={<ProtectedRoute roles={['Admin','Fleet Manager','Dispatcher']}><Layout><Vehicles /></Layout></ProtectedRoute>} />
      <Route path="/vehicles/:id" element={<ProtectedRoute roles={['Admin','Fleet Manager','Dispatcher']}><Layout><VehicleDetail /></Layout></ProtectedRoute>} />
      <Route path="/drivers" element={<ProtectedRoute roles={['Admin','Safety Officer','Dispatcher']}><Layout><Drivers /></Layout></ProtectedRoute>} />
      <Route path="/trips" element={<ProtectedRoute roles={['Admin','Fleet Manager','Dispatcher']}><Layout><Trips /></Layout></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute roles={['Admin','Fleet Manager']}><Layout><Maintenance /></Layout></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute roles={['Admin','Financial Analyst']}><Layout><Expenses /></Layout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute roles={['Admin','Fleet Manager','Financial Analyst']}><Layout><Analytics /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute roles={['Admin']}><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="*" element={token ? <Layout><NotFound /></Layout> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
