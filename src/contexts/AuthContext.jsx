import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
    user: null,
    profile: null,
    loading: true,
    signOut: () => { },
    refreshProfile: () => { },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let lastProfileFetchId = null;

        const handleAuthStateChange = async (event, session) => {
            if (!isMounted) return;
            console.log('Auth event:', event, session?.user?.id);

            if (session?.user) {
                // Estabiliza o usuário: Só atualiza se o ID mudar ou se não houver usuário
                setUser(current => {
                    if (current?.id === session.user.id) return current;
                    return session.user;
                });

                // Evita chamadas duplicadas para o mesmo usuário no mesmo evento
                if (lastProfileFetchId !== session.user.id) {
                    lastProfileFetchId = session.user.id;
                    await fetchProfile(session.user.id);
                }
            } else {
                setUser(null);
                setProfile(null);
                lastProfileFetchId = null;
            }

            setLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Se for INITIAL_SESSION, o getSession já vai resolver isso
            if (event !== 'INITIAL_SESSION') {
                handleAuthStateChange(event, session);
            }
        });

        // Initialize session
        const init = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                await handleAuthStateChange('INITIAL_SESSION', session);
            } catch (err) {
                console.error('Session init error:', err);
                if (isMounted) setLoading(false);
            }
        };

        init();

        const timeout = setTimeout(() => {
            if (isMounted) {
                setLoading(current => {
                    if (current) {
                        console.warn('Auth fallback: forçando carregamento após 15s');
                        return false;
                    }
                    return current;
                });
            }
        }, 15000);

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const fetchProfile = async (userId) => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, user_roles(role_id)')
                .eq('id', userId)
                .single();

            if (data) {
                // Flatten user_roles into a simple array of role strings safely
                const rolesData = data.user_roles;
                const roleArray = Array.isArray(rolesData)
                    ? rolesData.map(ur => ur.role_id)
                    : (rolesData?.role_id ? [rolesData.role_id] : ['student']);

                const flattenedProfile = {
                    ...data,
                    role: roleArray
                };
                setProfile(flattenedProfile);
            } else if (error && error.code !== 'PGRST116') {
                console.error('Erro ao rocurar perfil:', error);
            }
        } catch (err) {
            console.error('Falha no fetchProfile:', err.message);
        }
    };

    const signOut = async () => {
        try {
            setUser(null);
            setProfile(null);
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    const value = {
        user,
        profile,
        loading,
        signOut,
        refreshProfile: () => user && fetchProfile(user.id),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
