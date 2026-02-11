import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>; // Or a proper spinner
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export function PublicRoute() {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
