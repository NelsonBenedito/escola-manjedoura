import React, { useState } from 'react';
import Header from './Header';
import { motion } from 'framer-motion';
import { Camera, User, Mail, Shield, Save, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext';
import { compressImage } from '@/lib/compression';

export default function Profile() {
    const [loading, setLoading] = useState(false);
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const [userData, setUserData] = useState({
        id: '',
        name: '',
        email: '',
        bio: '',
        avatar: ''
    });

    React.useEffect(() => {
        if (!authLoading && user) {
            setUserData({
                id: user.id,
                name: profile?.full_name || '',
                email: user.email || '',
                bio: profile?.bio || '',
                avatar: profile?.avatar_url || ''
            });
        }
    }, [user, profile, authLoading]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            const updates = {
                id: user.id,
                full_name: userData.name,
                bio: userData.bio,
                avatar_url: userData.avatar,
                updated_at: new Date(),
            };

            let { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            await refreshProfile();
            toast.success("Perfil atualizado com sucesso!");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (event) => {
        try {
            setLoading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para carregar.');
            }

            const file = event.target.files[0];

            // Compress the image before upload
            toast.info("Otimizando imagem...");
            const compressedFile = await compressImage(file, { maxSizeMB: 1, maxWidthOrHeight: 1024 });

            const fileExt = compressedFile.name.split('.').pop();
            const fileName = `${userData.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedFile);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setUserData({ ...userData, avatar: publicUrl });
            toast.success("Imagem carregada! Não esqueça de salvar as alterações.");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-spiritual-dark text-white font-sans selection:bg-spiritual-gold/20">
            <Header />

            <main className="max-w-[1400px] mx-auto px-8 pt-32 pb-20">
                {authLoading ? (
                    <div className="flex flex-col md:flex-row gap-12 animate-pulse">
                        <div className="md:w-1/3 space-y-8">
                            <Card className="bg-secondary/10 border-white/5 rounded-[2rem] p-8 flex flex-col items-center">
                                <Skeleton className="w-40 h-40 rounded-full bg-white/5" />
                                <Skeleton className="h-8 w-32 mt-6 bg-white/5" />
                                <Skeleton className="h-4 w-24 mt-2 bg-white/5" />
                                <div className="mt-8 pt-8 border-t border-white/5 w-full space-y-4">
                                    <Skeleton className="h-4 w-full bg-white/5" />
                                    <Skeleton className="h-4 w-full bg-white/5" />
                                </div>
                            </Card>
                            <div className="space-y-4">
                                <Skeleton className="h-14 w-full rounded-2xl bg-white/5" />
                                <Skeleton className="h-14 w-full rounded-2xl bg-white/5" />
                            </div>
                        </div>
                        <div className="md:w-2/3">
                            <Card className="bg-secondary/5 border-white/5 rounded-[2rem] p-12 space-y-8">
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-64 bg-white/5" />
                                    <Skeleton className="h-4 w-full bg-white/5" />
                                </div>
                                <div className="space-y-8 mt-12">
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-24 bg-white/5" />
                                        <Skeleton className="h-14 w-full rounded-2xl bg-white/5" />
                                    </div>
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-24 bg-white/5" />
                                        <Skeleton className="h-14 w-full rounded-2xl bg-white/5" />
                                    </div>
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-24 bg-white/5" />
                                        <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Sidebar / Photo Section */}
                            <div className="md:w-1/3 space-y-8">
                                <Card className="bg-secondary/10 border-white/5 rounded-[2rem] overflow-hidden p-8 flex flex-col items-center text-center">
                                    <div className="relative group mb-6">
                                        <Avatar className="w-40 h-40 border-4 border-spiritual-gold/20">
                                            <AvatarImage src={userData.avatar} crossOrigin="anonymous" />
                                            <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-serif">
                                                {userData.name ? userData.name.charAt(0) : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            disabled={loading}
                                        />
                                        <button
                                            onClick={() => document.getElementById('avatar-upload').click()}
                                            className="absolute bottom-2 right-2 p-3 bg-spiritual-gold text-spiritual-dark rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={loading}
                                            type="button"
                                        >
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h2 className="text-2xl font-serif mb-1">{userData.name}</h2>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Membro desde Fev, 2026</p>

                                    <div className="mt-8 pt-8 border-t border-white/5 w-full flex flex-col gap-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Status</span>
                                            <Badge variant="secondary" className="bg-spiritual-gold/10 text-spiritual-gold border-spiritual-gold/20">Ativo</Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Cursos</span>
                                            <span className="font-bold">4 Concluídos</span>
                                        </div>
                                    </div>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-spiritual-gold/50 px-2">Configurações Rápidas</h3>
                                    <Button variant="ghost" className="w-full justify-start gap-3 p-4 h-auto rounded-2xl hover:bg-white/5">
                                        <Shield className="w-4 h-4 text-spiritual-gold" />
                                        <span>Alterar Senha</span>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start gap-3 p-4 h-auto rounded-2xl hover:bg-white/5">
                                        <Mail className="w-4 h-4 text-spiritual-gold" />
                                        <span>Preferências de E-mail</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Main Content Section */}
                            <div className="md:w-2/3">
                                <Card className="bg-secondary/5 border-white/5 rounded-[2rem] p-8 md:p-12">
                                    <CardHeader className="px-0 pt-0 mb-8">
                                        <CardTitle className="text-3xl font-serif">Configurações de <span className="text-spiritual-gold italic">Perfil</span></CardTitle>
                                        <CardDescription>Gerencie suas informações pessoais e como elas aparecem para a comunidade.</CardDescription>
                                    </CardHeader>

                                    <form onSubmit={handleUpdate} className="space-y-8">
                                        <div className="grid grid-cols-1 gap-8">
                                            <div className="space-y-3">
                                                <Label htmlFor="name" className="text-xs uppercase tracking-widest ml-1">Nome Completo</Label>
                                                <Input
                                                    id="name"
                                                    value={userData.name}
                                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-spiritual-gold/50 transition-all text-lg"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="email" className="text-xs uppercase tracking-widest ml-1">E-mail de Acesso</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={userData.email}
                                                    disabled
                                                    className="h-14 bg-white/2 border-white/5 rounded-2xl opacity-50 cursor-not-allowed"
                                                />
                                                <p className="text-[10px] text-muted-foreground ml-1">Para alterar seu e-mail, entre em contato com o suporte.</p>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="bio" className="text-xs uppercase tracking-widest ml-1">Sobre Mim (Biografia)</Label>
                                                <textarea
                                                    id="bio"
                                                    value={userData.bio}
                                                    onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                                                    className="w-full min-h-[120px] p-4 bg-white/5 border-white/10 rounded-2xl focus:border-spiritual-gold/50 transition-all resize-none outline-none"
                                                    placeholder="Conte um pouco sobre sua jornada..."
                                                />
                                            </div>
                                        </div>

                                        <Separator className="bg-white/5" />

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="rounded-full px-12 py-7 h-auto bg-spiritual-gold text-spiritual-dark font-bold uppercase tracking-widest text-xs hover:bg-spiritual-sand transition-all gap-3 shadow-lg shadow-spiritual-gold/10"
                                            >
                                                {loading ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

