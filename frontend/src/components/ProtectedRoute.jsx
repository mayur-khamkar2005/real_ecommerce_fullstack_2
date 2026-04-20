import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="p-8 text-center text-textMuted text-xs uppercase tracking-widest">Session…</div>;
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but route is admin-only and user is not admin
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/store" replace />;
  }

  // Allowed
  return <Outlet />;
};

export default ProtectedRoute;
