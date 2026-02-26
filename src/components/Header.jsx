import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import logo from '../../public/ManjedouraMovimentoIcon.svg';
import RotationButton from './RotationButton';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, BookOpen, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { toast } from 'sonner';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (profile) {
            console.log("Current Profile Role:", profile.role);
        }
    }, [profile]);

    const userDisplay = user ? {
        id: user.id,
        name: profile?.full_name || user.email.split('@')[0],
        email: user.email,
        avatar: profile?.avatar_url || ''
    } : null;

    const handleLogout = async () => {
        navigate('/');
        setTimeout(async () => {
            await signOut();
            toast.success("Sessão encerrada");
        }, 100);
    };

    const navItems = ['Jornada', 'Ensino', 'Comunidade'];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass py-4 shadow-2xl shadow-black/20' : 'bg-transparent py-8'
                } flex items-center justify-between px-8`}
        >
            <div className="flex items-center gap-12">
                <Link to="/" className="flex items-center gap-3 group cursor-pointer h-12">
                    <img src={logo} alt="Manjedoura Encontro Logo" className="h-full w-auto object-contain" />
                </Link>

                {!userDisplay && (
                    <nav className="hidden lg:flex items-center gap-4">
                        {navItems.map((item) => (
                            <RotationButton
                                key={item}
                                item={item}
                                href={`#${item.toLowerCase()}`}
                            />
                        ))}
                    </nav>
                )}
            </div>

            <div className="flex items-center gap-4">
                {userDisplay ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 group hover:bg-white/5 rounded-full px-4 py-1 h-auto border border-white/5 backdrop-blur-sm">
                                <div className="hidden sm:flex flex-col items-end md:mr-1">
                                    <span className="text-[10px] uppercase tracking-widest font-bold">{userDisplay.name}</span>
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">
                                        {profile?.role?.includes('admin') ? 'Administrador' : profile?.role?.includes('instructor') ? 'Instrutor' : 'Aluno'}
                                    </span>
                                </div>
                                <Avatar className="w-10 h-10 border-2 border-spiritual-gold/20 shadow-lg">
                                    <AvatarImage src={userDisplay.avatar} crossOrigin="anonymous" />
                                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                        {userDisplay.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-spiritual-dark/95 border-white/10 backdrop-blur-2xl p-2 rounded-2xl text-white">
                            <DropdownMenuLabel className="flex flex-col p-4 mb-2">
                                <span className="text-sm font-semibold">{userDisplay?.name}</span>
                                <span className="text-xs text-muted-foreground">{userDisplay?.email}</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5 mb-2" />
                            {(profile?.role?.includes('admin') || profile?.role === 'admin') && (
                                <>
                                    <DropdownMenuItem asChild className="p-3 rounded-xl focus:bg-white/5 cursor-pointer">
                                        <Link to="/admin" className="flex items-center gap-3">
                                            <LayoutDashboard className="w-4 h-4 text-spiritual-gold" />
                                            <span className="font-bold">Painel Administrativo</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/5 mb-2" />
                                </>
                            )}
                            <DropdownMenuItem asChild className="p-3 rounded-xl focus:bg-white/5 cursor-pointer">
                                <Link to="/aulas" className="flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-spiritual-gold" />
                                    <span >Minhas Aulas</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="p-3 rounded-xl focus:bg-white/5 cursor-pointer">
                                <Link to="/perfil" className="flex items-center gap-3">
                                    <UserIcon className="w-4 h-4 text-spiritual-gold" />
                                    <span>Meu Perfil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/5 cursor-pointer">
                                <Settings className="w-4 h-4 text-spiritual-gold" />
                                <span>Configurações</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                            <DropdownMenuItem onClick={handleLogout} className="p-3 rounded-xl focus:bg-destructive/10 text-destructive cursor-pointer">
                                <LogOut className="w-4 h-4" />
                                <span>Sair</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="ghost" className="flex items-center gap-2 group hover:bg-transparent" asChild>
                        <Link to="/auth">
                            <span className="text-[10px] uppercase tracking-widest font-bold group-hover:text-spiritual-gold transition-colors">Portal do Aluno</span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 group-hover:border-spiritual-gold transition-colors">
                                <UserIcon className="w-4 h-4" />
                            </div>
                        </Link>
                    </Button>
                )}

                {!user && (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden hover:bg-white/5 rounded-full"
                            >
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-spiritual-dark/95 border-l-white/10 backdrop-blur-2xl flex flex-col items-center justify-center gap-8">
                            <SheetHeader className="hidden">
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            {['Jornada', 'Ensino', 'Comunidade'].map((item, i) => (
                                <SheetClose asChild key={item}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            to={`/#${item.toLowerCase()}`}
                                            className="text-4xl font-serif hover:text-spiritual-gold transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    </motion.div>
                                </SheetClose>
                            ))}
                            <SheetClose asChild>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-4"
                                >
                                    <Link
                                        to="/auth"
                                        className="text-2xl font-serif text-spiritual-gold hover:text-white transition-colors"
                                    >
                                        Portal do Aluno
                                    </Link>
                                </motion.div>
                            </SheetClose>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </motion.header>
    );
}
