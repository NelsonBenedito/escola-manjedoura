import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Play,
    CheckCircle2,
    Clock,
    User,
    ArrowRight,
    BookOpen,
    Shield,
    FileText,
    Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function LessonPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [nextLessons, setNextLessons] = useState([]);
    const [moduleTotalDuration, setModuleTotalDuration] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                // Só mostra o esqueleto se estivermos mudando de aula ou se for o primeiro carregamento
                if (!lesson || lesson.id !== id) {
                    setLoading(true);
                }

                // Fetch current lesson
                const { data: lessonData, error: lessonError } = await supabase
                    .from('lessons')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();

                if (lessonError) throw lessonError;
                if (lessonData) setLesson(lessonData);

                // Fetch completion status
                if (user?.id) {
                    const { data: progressData } = await supabase
                        .from('user_progress')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('lesson_id', id)
                        .maybeSingle();

                    setCompleted(!!progressData);
                }

                // Fetch other lessons from the same module
                if (lessonData) {
                    const { data: moduleLessons, error: moduleError } = await supabase
                        .from('lessons')
                        .select('id, title, duration, module, thumbnail_url')
                        .eq('module', lessonData.module);

                    if (!moduleError && moduleLessons) {
                        const total = moduleLessons.reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0);
                        setModuleTotalDuration(total);

                        // Fetch all completed lessons for this user in this module
                        let completedIds = [];
                        if (user?.id) {
                            const { data: progressData } = await supabase
                                .from('user_progress')
                                .select('lesson_id')
                                .eq('user_id', user.id)
                                .in('lesson_id', moduleLessons.map(l => l.id));

                            if (progressData) {
                                completedIds = progressData.map(p => p.lesson_id);
                            }
                        }

                        // Filter: 1. Not current lesson, 2. Not completed
                        const filtered = moduleLessons.filter(l =>
                            l.id !== id && !completedIds.includes(l.id)
                        );

                        setNextLessons(filtered.slice(0, 3));
                    }
                }
            } catch (err) {
                console.error('Error fetching lesson:', err);
                toast.error("Erro ao carregar a aula");
            } finally {
                setLoading(false);
            }
        };

        fetchLessonData();
        window.scrollTo(0, 0);
    }, [id, user?.id]); // Use user.id instead of the user object to keep dependencies stable

    const handleToggleComplete = async () => {
        if (!user || !lesson) return;

        try {
            setCompleting(true);
            if (completed) {
                // Remove completion
                const { error } = await supabase
                    .from('user_progress')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('lesson_id', lesson.id);

                if (error) throw error;
                setCompleted(false);
                toast.info("Status de conclusão removido");
            } else {
                // Mark as complete
                const { error } = await supabase
                    .from('user_progress')
                    .insert({
                        user_id: user.id,
                        lesson_id: lesson.id
                    });

                if (error) throw error;
                setCompleted(true);
                toast.success("Aula concluída com sucesso!");

                // Se houver uma próxima aula, sugerir navegar? Ou apenas dar feedback.
                if (nextLessons.length > 0) {
                    setTimeout(() => {
                        toast.info(`Próxima aula: ${nextLessons[0].title}`, {
                            action: {
                                label: "Assistir agora",
                                onClick: () => navigate(`/assistir/${nextLessons[0].id}`)
                            }
                        });
                    }, 1000);
                }
            }
        } catch (err) {
            console.error("Error toggling lesson completion:", err);
            toast.error("Erro ao atualizar status da aula");
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-spiritual-dark text-white">
                <Header />
                <main className="pt-32 pb-20 px-8 max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-2/3 space-y-8">
                            <Skeleton className="aspect-video w-full rounded-[2rem] bg-white/5" />
                            <Skeleton className="h-10 w-1/2 bg-white/5" />
                            <Skeleton className="h-20 w-full bg-white/5" />
                        </div>
                        <div className="lg:w-1/3 space-y-4">
                            <Skeleton className="h-64 w-full rounded-[2rem] bg-white/5" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-spiritual-dark flex flex-col items-center justify-center">
                <Header />
                <h1 className="text-2xl font-serif mb-6 text-white">Aula não encontrada</h1>
                <Button asChild className="bg-spiritual-gold text-spiritual-dark">
                    <Link to="/aulas">Voltar para a Jornada</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-spiritual-dark text-white font-sans selection:bg-spiritual-gold/20">
            <Header />

            <main className="pt-28 md:pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="mb-8">
                    <Button
                        onClick={() => navigate('/aulas')}
                        variant="ghost"
                        className="text-muted-foreground hover:text-spiritual-gold gap-2 px-6 py-2 h-auto"
                    >
                        <ChevronLeft className="w-4 h-4" /> Voltar para a Jornada
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Primary Content: Video & Details */}
                    <div className="lg:w-2/3 space-y-8">
                        {/* Video Player Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5 group"
                        >
                            <video
                                src={lesson.video_url}
                                controls
                                className="w-full h-full"
                                poster={lesson.thumbnail_url}
                                onEnded={() => {
                                    if (!completed) {
                                        handleToggleComplete();
                                    }
                                }}
                            />
                        </motion.div>

                        {/* Title & Stats */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="bg-spiritual-gold/10 text-spiritual-gold border-spiritual-gold/20 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold">
                                    {lesson.module}
                                </Badge>
                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
                                    <Clock className="w-3.5 h-3.5" />
                                    {moduleTotalDuration || '0'} min total
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif">{lesson.title}</h1>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-spiritual-gold/10 flex items-center justify-center text-spiritual-gold">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">Instrutor</span>
                                        <span className="text-sm font-bold">{lesson.instructor}</span>
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="h-8 bg-white/5" />
                                <Button
                                    onClick={handleToggleComplete}
                                    disabled={completing}
                                    className={cn(
                                        "rounded-full px-6 border transition-all gap-2",
                                        completed
                                            ? "bg-spiritual-gold/20 text-spiritual-gold border-spiritual-gold/30 hover:bg-spiritual-gold/30"
                                            : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                                    )}
                                >
                                    {completed ? (
                                        <><CheckCircle2 className="w-4 h-4 fill-spiritual-gold" /> Aula Concluída</>
                                    ) : (
                                        <><CheckCircle2 className="w-4 h-4" /> Concluir Aula</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Description */}
                        <Card className="bg-secondary/5 border-white/5 rounded-[2rem] p-8 md:p-10">
                            <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-spiritual-gold" />
                                Sobre esta lição
                            </h3>
                            <div className="prose prose-invert prose-spiritual max-w-none text-muted-foreground leading-relaxed">
                                {lesson.description || "Esta aula mergulha nas profundezas da identidade e do propósito, revelando verdades transformadoras para sua jornada espiritual. Prepare o seu coração para receber uma nova medida de honra e entendimento."}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar: Next Lessons & Resources */}
                    <div className="lg:w-1/3 space-y-8">
                        {/* Materials Section */}
                        {lesson.pdf_url && (
                            <Card className="bg-spiritual-gold/5 border-spiritual-gold/10 rounded-[2rem] p-8">
                                <h3 className="text-lg font-serif mb-6 text-spiritual-gold">Material Complementar</h3>
                                <a
                                    href={lesson.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-spiritual-gold/30 hover:bg-white/10 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-spiritual-gold/20 flex items-center justify-center text-spiritual-gold group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Documento PDF</p>
                                        <p className="text-sm font-medium truncate">Apostila da Lição</p>
                                    </div>
                                    <Download className="w-5 h-5 text-spiritual-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </Card>
                        )}

                        {/* Next in Module */}
                        <Card className="bg-secondary/10 border-white/5 rounded-[2rem] p-8">
                            <h3 className="text-lg font-serif mb-6 text-spiritual-gold italic">Continuação do Módulo</h3>
                            <div className="space-y-4">
                                {nextLessons.length > 0 ? (
                                    nextLessons.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={`/assistir/${item.id}`}
                                            className="group flex flex-col p-4 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-spiritual-gold/30 transition-all"
                                        >
                                            <div className="relative w-full h-24 rounded-lg overflow-hidden mb-3">
                                                <img
                                                    src={item.thumbnail_url || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase opacity-60 mb-2">{item.duration || '45 min'}</span>
                                            <h4 className="font-medium text-sm text-white group-hover:text-spiritual-gold transition-colors line-clamp-2">{item.title}</h4>
                                            <div className="flex items-center gap-2 mt-3 text-spiritual-gold/50 group-hover:text-spiritual-gold">
                                                <Play className="w-4 h-4 fill-current" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Assistir Agora</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">Todas as aulas deste módulo foram concluídas.</p>
                                )}
                            </div>
                        </Card>

                        {/* Additional Resources */}
                        <Card className="bg-linear-to-br from-spiritual-gold/5 to-transparent border-spiritual-gold/10 rounded-[2rem] p-8">
                            <h3 className="text-lg font-serif mb-4 flex items-center gap-2 text-spiritual-gold">
                                <Shield className="w-5 h-5" />
                                Material de Apoio
                            </h3>
                            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                                Baixe o PDF de meditação e os exercícios práticos desta aula para aprofundar sua experiência.
                            </p>
                            <Button className="w-full bg-spiritual-gold/10 hover:bg-spiritual-gold/20 text-spiritual-gold border border-spiritual-gold/20 rounded-xl uppercase tracking-widest text-[10px] font-bold h-12">
                                Download PDF
                            </Button>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
