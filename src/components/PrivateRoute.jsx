import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-spiritual-dark flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-spiritual-gold/20 border-t-spiritual-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        // Redireciona para o login guardando a página que ele tentou acessar
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;
