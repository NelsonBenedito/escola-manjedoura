import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import logo from '../assets/ManjedouraLogoWhite.png';
import { useAuth } from '@/contexts/AuthContext';

const authSchema = z.object({
    email: z.string().email({ message: "E-mail inválido" }),
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

export default function AuthPage() {
    const [loading, setLoading] = useState(false);
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/aulas');
        }
    }, [user, authLoading, navigate]);

    const form = useForm({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onLogin = async (data) => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                if (error.message === "Email not confirmed") {
                    toast.error("Por favor, confirme seu e-mail antes de entrar ou desative a confirmação no Supabase.");
                } else if (error.status === 400) {
                    toast.error("E-mail ou senha incorretos.");
                } else {
                    toast.error(error.message);
                }
                setLoading(false);
            } else {
                toast.success("Login realizado com sucesso!");
                setLoading(false);
                // The global redirect in useEffect will handle navigation
            }
        } catch (err) {
            toast.error("Erro inesperado ao entrar");
            setLoading(false);
        }
    };

    const onSignUp = async (data) => {
        try {
            setLoading(true);
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                toast.error(authError.message);
            } else if (authData.user) {
                toast.success("Cadastro realizado! Verifique seu e-mail.");
            }
        } catch (err) {
            toast.error("Erro inesperado ao cadastrar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
            {/* Aesthetic Background */}
            <div className="noise-overlay opacity-5"></div>
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(197,179,88,0.05)_0%,transparent_50%)] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="h-16 w-auto mb-6" />
                    </Link>
                    <h1 className="text-2xl font-serif tracking-tight text-center">
                        Bem-vindo ao <span className="text-spiritual-gold">Projeto Manjedoura</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2 text-center">
                        Revelando o propósito através da identidade.
                    </p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/20">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onLogin)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder="seu@email.com" {...field} className="bg-secondary/10 border-white/5 h-12 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••" {...field} className="bg-secondary/10 border-white/5 h-12 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 rounded-xl bg-spiritual-gold text-spiritual-dark font-bold hover:bg-spiritual-sand transition-all" disabled={loading}>
                                    {loading ? "Entrando..." : "Entrar"}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="signup">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSignUp)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder="seu@email.com" {...field} className="bg-secondary/10 border-white/5 h-12 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••" {...field} className="bg-secondary/10 border-white/5 h-12 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 rounded-xl bg-spiritual-gold text-spiritual-dark font-bold hover:bg-spiritual-sand transition-all" disabled={loading}>
                                    {loading ? "Cadastrando..." : "Criar Conta"}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-xs text-muted-foreground hover:text-spiritual-gold transition-colors flex items-center justify-center gap-2">
                        <span>← Voltar para o início</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
