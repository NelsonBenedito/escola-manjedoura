import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-spiritual-dark flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-spiritual-gold/20 border-t-spiritual-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || profile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
