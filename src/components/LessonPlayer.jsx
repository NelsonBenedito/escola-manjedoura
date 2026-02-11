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
    Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/components/ui/skeleton";

export default function LessonPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [nextLessons, setNextLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                setLoading(true);
                // Fetch current lesson
                const { data: lessonData, error: lessonError } = await supabase
                    .from('lessons')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (lessonError) throw lessonError;
                setLesson(lessonData);

                // Fetch other lessons from the same module as "next"
                if (lessonData) {
                    const { data: nextData, error: nextError } = await supabase
                        .from('lessons')
                        .select('id, title, duration, module')
                        .eq('module', lessonData.module)
                        .neq('id', id)
                        .limit(3);

                    if (!nextError) setNextLessons(nextData);
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
    }, [id]);

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
            <div className="min-h-screen bg-spiritual-dark flex flex-col items-center justify-center p-8">
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
                        className="text-muted-foreground hover:text-spiritual-gold gap-2 p-0 h-auto"
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
                                    {lesson.duration || '45 min'}
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
                                <Button className="bg-white/5 hover:bg-white/10 text-white rounded-full px-6 border border-white/10 gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-spiritual-gold" />
                                    Concluir Aula
                                </Button>
                            </div>
                        </div>

                        {/* Description */}
                        <Card className="bg-secondary/5 border-white/5 rounded-[2rem] p-8 md:p-10">
                            <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-spiritual-gold" />
                                Sobre esta Revelação
                            </h3>
                            <div className="prose prose-invert prose-spiritual max-w-none text-muted-foreground leading-relaxed">
                                {lesson.description || "Esta aula mergulha nas profundezas da identidade e do propósito, revelando verdades transformadoras para sua jornada espiritual. Prepare o seu coração para receber uma nova medida de honra e entendimento."}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar: Next Lessons & Resources */}
                    <div className="lg:w-1/3 space-y-8">
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
                                    <p className="text-xs text-muted-foreground italic">Todas as aulas deste módulo foram concluídas ou você está no fim da jornada.</p>
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
