import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { motion } from 'framer-motion';
import { Play, Clock, ChevronRight, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";

export default function Lessons() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchLessons = async () => {
            try {
                const { data, error } = await supabase
                    .from('lessons')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setLessons(data || []);
            } catch (err) {
                console.error('Error fetching lessons:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.module.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="noise-overlay opacity-5"></div>

            <main className="pt-32 pb-20 px-8 max-w-[1400px] mx-auto">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-serif mb-4"
                        >
                            Minhas <span className="text-spiritual-gold italic">Aulas</span>
                        </motion.h1>
                        <p className="text-muted-foreground">Continue sua jornada de revelação e honra.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar aula ou módulo..."
                                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-spiritual-gold/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button size="icon" variant="outline" className="h-12 w-12 rounded-xl border-white/10">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Featured Card */}
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-16"
                    >
                        {(() => {
                            const featured = lessons[0] || {
                                title: "A Jornada do propósito",
                                module: "A Jornada do propósito",
                                duration: "45 min",
                                thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2600",
                                id: null
                            };

                            return (
                                <Card
                                    onClick={() => featured.id && navigate(`/assistir/${featured.id}`)}
                                    className="relative h-[400px] md:h-[500px] overflow-hidden rounded-[2rem] border-none group cursor-pointer shadow-2xl"
                                >
                                    <img
                                        src={featured.thumbnail || featured.thumbnail_url || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2600"}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        alt="Destaque"
                                        crossOrigin="anonymous"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                                        <Badge className="w-fit mb-6 bg-spiritual-gold text-spiritual-dark font-bold uppercase tracking-widest text-[10px]">Primeira Aula</Badge>
                                        <h2 className="text-3xl md:text-5xl font-serif mb-6 group-hover:text-spiritual-gold transition-colors max-w-2xl">{featured.title}</h2>
                                        <div className="flex items-center gap-6 text-sm text-white/60">
                                            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {featured.duration || '45 min'}</span>
                                            <span className="flex items-center gap-2">Módulo: {featured.module}</span>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="w-fit mt-8 rounded-full px-10 bg-white text-black hover:bg-spiritual-gold transition-all gap-3 h-14 font-bold uppercase tracking-wider text-xs"
                                        >
                                            <Play className="w-4 h-4 fill-current" /> Assistir Agora
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })()}
                    </motion.div>
                )}

                {/* Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-[250px] w-full rounded-[2rem] bg-white/5" />
                                <Skeleton className="h-6 w-3/4 bg-white/5" />
                                <Skeleton className="h-4 w-full bg-white/5" />
                            </div>
                        ))
                    ) : filteredLessons.length > 0 ? (
                        filteredLessons.map((lesson, index) => (
                            <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    onClick={() => navigate(`/assistir/${lesson.id}`)}
                                    className="bg-secondary/5 border-white/5 rounded-[2rem] overflow-hidden group hover:border-white/10 transition-all cursor-pointer h-full border"
                                >
                                    <div className="relative h-[250px] overflow-hidden">
                                        <img
                                            src={lesson.thumbnail || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000"}
                                            alt={lesson.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            crossOrigin="anonymous"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-spiritual-dark to-transparent opacity-60"></div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-white/10 text-muted-foreground">{lesson.module}</Badge>
                                            <span className="text-[10px] uppercase tracking-widest text-white/40">{lesson.duration || 'Aprox. 45 min'}</span>
                                        </div>
                                        <h3 className="text-xl font-serif mb-3 group-hover:text-spiritual-gold transition-colors">{lesson.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{lesson.description || 'Sem descrição.'}</p>
                                        <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                            <span className="text-xs text-white/30 italic">Por {lesson.instructor}</span>
                                            <Button variant="ghost" size="sm" className="hover:text-spiritual-gold h-auto p-0">
                                                Entrar <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-muted-foreground italic">Nenhuma aula encontrada para esta busca.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
