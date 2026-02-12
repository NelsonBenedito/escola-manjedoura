import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { motion } from 'framer-motion';
import { Play, Clock, ChevronRight, Search, Filter, X, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext';

export default function Lessons() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [lessons, setLessons] = useState([]);
    const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState(null);
    const { user } = useAuth();

    React.useEffect(() => {
        const fetchLessons = async () => {
            try {
                // Fetch lessons
                const { data, error } = await supabase
                    .from('lessons')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setLessons(data || []);

                // Fetch user progress if logged in
                if (user) {
                    const { data: progressData } = await supabase
                        .from('user_progress')
                        .select('lesson_id')
                        .eq('user_id', user.id);

                    if (progressData) {
                        setCompletedLessonIds(new Set(progressData.map(p => p.lesson_id)));
                    }
                }
            } catch (err) {
                console.error('Error fetching lessons:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [user]);

    // Group lessons by module and calculate progress
    const groupedModules = React.useMemo(() => {
        const groups = lessons.reduce((acc, lesson) => {
            const m = lesson.module || 'Sem Módulo';
            if (!acc[m]) {
                acc[m] = {
                    name: m,
                    lessons: [],
                    totalDuration: 0,
                    remainingDuration: 0,
                    completedCount: 0,
                    thumbnail: lesson.thumbnail || lesson.thumbnail_url
                };
            }
            acc[m].lessons.push(lesson);
            const duration = parseInt(lesson.duration) || 0;
            acc[m].totalDuration += duration;

            if (completedLessonIds.has(lesson.id)) {
                acc[m].completedCount += 1;
            } else {
                acc[m].remainingDuration += duration;
            }
            return acc;
        }, {});
        return Object.values(groups);
    }, [lessons, completedLessonIds]);

    const filteredModules = groupedModules.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.lessons.some(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="noise-overlay opacity-5"></div>

            <main className="pt-32 pb-20 px-8 max-w-[1400px] mx-auto">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-serif mb-4"
                        >
                            Minha <span className="text-spiritual-gold italic">jornada</span>
                        </motion.h1>
                        <p className="text-muted-foreground">Continue sua jornada de revelação através dos módulos.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar módulo ou aula..."
                                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-spiritual-gold/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-[300px] w-full rounded-[2.5rem] bg-white/5" />
                                <Skeleton className="h-6 w-3/4 bg-white/5" />
                                <Skeleton className="h-4 w-full bg-white/5" />
                            </div>
                        ))
                    ) : filteredModules.length > 0 ? (
                        filteredModules.map((module, index) => {
                            const progress = module.lessons.length > 0 ? (module.completedCount / module.lessons.length) * 100 : 0;
                            const isCompleted = progress === 100;

                            return (
                                <motion.div
                                    key={module.name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card
                                        onClick={() => setSelectedModule(module)}
                                        className="relative bg-secondary/5 border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-spiritual-gold/20 transition-all duration-500 hover:shadow-2xl hover:shadow-spiritual-gold/5 cursor-pointer h-full flex flex-col"
                                    >
                                        {/* Module Image/Banner */}
                                        <div className="relative h-48 overflow-hidden grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700">
                                            <img
                                                src={module.thumbnail || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2600"}
                                                className="w-full h-full object-cover"
                                                alt={module.name}
                                                crossOrigin="anonymous"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
                                            {isCompleted && (
                                                <div className="absolute top-6 right-6 bg-spiritual-gold text-spiritual-dark px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                                    Concluído
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-8 flex-1 flex flex-col">
                                            <Badge variant="outline" className="w-fit mb-4 text-[9px] uppercase tracking-[0.2em] border-spiritual-gold/20 text-spiritual-gold">Módulo</Badge>
                                            <h3 className="text-2xl font-serif mb-2 group-hover:text-spiritual-gold transition-colors">{module.name}</h3>

                                            <div className="mt-6 space-y-4 flex-1">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Progresso</span>
                                                    <span className="text-[10px] font-mono text-spiritual-gold">{Math.round(progress)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                                                    <motion.div
                                                        className="h-full bg-spiritual-gold"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pb-6">
                                                    <div className="bg-white/2 rounded-2xl p-4 border border-white/5 text-center">
                                                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Aulas</p>
                                                        <p className="text-lg font-serif">{module.completedCount}/{module.lessons.length}</p>
                                                    </div>
                                                    <div className="bg-white/2 rounded-2xl p-4 border border-white/5 text-center">
                                                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Faltam</p>
                                                        <p className="text-lg font-serif text-spiritual-gold">{module.remainingDuration} min</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Find the first uncompleted lesson, or the first one if all are done
                                                    const nextLesson = module.lessons.find(l => !completedLessonIds.has(l.id)) || module.lessons[0];
                                                    navigate(`/assistir/${nextLesson.id}`);
                                                }}
                                                className="w-full bg-white/5 hover:bg-spiritual-gold text-white hover:text-spiritual-dark rounded-2xl h-14 font-bold uppercase tracking-widest text-[10px] transition-all duration-300 border border-white/10 hover:border-spiritual-gold"
                                            >
                                                {isCompleted ? "Rever Módulo" : "Continuar Aprendizado"}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-muted-foreground italic tracking-widest uppercase text-xs">A jornada ainda não começou...</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Netflix-style Module Modal */}
            {selectedModule && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedModule(null)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        layoutId={`module-${selectedModule.name}`}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-5xl bg-spiritual-dark border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Modal Header/Banner */}
                        <div className="relative h-64 shrink-0 transition-all duration-700">
                            <img
                                src={selectedModule.thumbnail || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2600"}
                                className="w-full h-full object-cover grayscale-[0.3]"
                                alt={selectedModule.name}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-spiritual-dark via-spiritual-dark/40 to-transparent" />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedModule(null)}
                                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/50 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white transition-all z-10"
                            >
                                <X className="w-5 h-5" />
                            </Button>

                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                                <Badge variant="outline" className="w-fit mb-4 text-[10px] uppercase tracking-[0.3em] bg-spiritual-gold/10 border-spiritual-gold/30 text-spiritual-gold backdrop-blur-md">Módulo em Destaque</Badge>
                                <h2 className="text-4xl md:text-5xl font-serif text-white">{selectedModule.name}</h2>
                            </div>
                        </div>

                        {/* Episodes List */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-serif text-white italic">Episódios</h3>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                                    {selectedModule.lessons.length} Aulas • {selectedModule.totalDuration} Minutos Totais
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {selectedModule.lessons.map((lesson, idx) => (
                                    <motion.div
                                        key={lesson.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => navigate(`/assistir/${lesson.id}`)}
                                        className="group relative flex items-center gap-6 p-4 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-spiritual-gold/20 transition-all cursor-pointer"
                                    >
                                        <div className="text-2xl font-serif text-white/20 group-hover:text-spiritual-gold/40 w-8 text-center transition-colors">
                                            {idx + 1}
                                        </div>

                                        <div className="relative w-32 md:w-40 aspect-video rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={lesson.thumbnail || lesson.thumbnail_url || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000"}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={lesson.title}
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 rounded-full bg-spiritual-gold flex items-center justify-center shadow-xl">
                                                    <Play className="w-5 h-5 text-spiritual-dark fill-current" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-base font-medium text-white group-hover:text-spiritual-gold transition-colors truncate">{lesson.title}</h4>
                                                {completedLessonIds.has(lesson.id) && (
                                                    <CheckCircle2 className="w-4 h-4 text-spiritual-gold shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2 opacity-60">
                                                {lesson.description || "Inicie sua caminhada nesta lição de honra e propósito."}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{lesson.duration || 0} min</span>
                                                {completedLessonIds.has(lesson.id) && (
                                                    <span className="text-[10px] text-spiritual-gold uppercase tracking-widest font-bold">Concluída</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="hidden md:flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                                            <ChevronRight className="w-5 h-5 text-spiritual-gold" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
