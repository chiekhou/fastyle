import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

// Guard : utilisateur connecté
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) return <Spinner fullPage />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

// Guard : admin seulement
export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location                   = useLocation();

  if (loading)   return <Spinner fullPage />;
  if (!user)     return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin)  return <Navigate to="/" replace />;

  return children;
}

// Guard : rediriger si déjà connecté
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner fullPage />;
  if (user)    return <Navigate to="/" replace />;

  return children;
}
