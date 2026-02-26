import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import AuthPage from './components/AuthPage'
import Lessons from './components/Lessons'
import Profile from './components/Profile'
import AdminDashboard from './components/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import PrivateRoute from './components/PrivateRoute'
import LessonPlayer from './components/LessonPlayer'
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from './contexts/AuthContext'
import { UploadProvider } from './contexts/UploadContext'
import UploadProgressOverlay from './components/UploadProgressOverlay'

function App() {
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <AuthProvider>
            <UploadProvider>
                <Router>
                    <div className="min-h-screen bg-background text-foreground">
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/aulas" element={
                                <PrivateRoute>
                                    <Lessons />
                                </PrivateRoute>
                            } />
                            <Route path="/perfil" element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } />
                            <Route path="/assistir/:id" element={
                                <PrivateRoute>
                                    <LessonPlayer />
                                </PrivateRoute>
                            } />
                            <Route
                                path="/admin"
                                element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                }
                            />
                        </Routes>
                        <UploadProgressOverlay />
                        <Toaster position="top-center" richColors />
                    </div>
                </Router>
            </UploadProvider>
        </AuthProvider>
    )
}

export default App
