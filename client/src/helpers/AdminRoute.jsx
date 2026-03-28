import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * AdminRoute — protects /admin/* pages.
 * - Not logged in           → /login
 * - Logged in, not admin    → /dashboard  (normal user)
 * - Logged in, role=admin   → renders children
 */
export default function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return null; // wait for localStorage restore

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;

    return children;
}
