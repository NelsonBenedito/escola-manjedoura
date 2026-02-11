import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Clock, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const courses = [
    {
        id: 1,
        title: "Fundamentos da Redenção",
        category: "Teologia Prática",
        duration: "12 semanas",
        image: "https://images.unsplash.com/photo-1544427928-c49cdfebf194?auto=format&fit=crop&q=80&w=1000",
        description: "Explore as bases teológicas e filosóficas da redenção humana.",
        available: true
    },
    {
        id: 2,
        title: "Práticas Contemplativas",
        category: "Propósito & Identidade",
        duration: "8 semanas",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000",
        description: "Desenvolva o silêncio interior e a escuta ativa do divino.",
        available: false
    },
    {
        id: 3,
        title: "Liderança de Comunidade",
        category: "Serviço",
        duration: "16 semanas",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000",
        description: "Como conduzir grupos e revelar talentos com empatia e propósito.",
        available: false
    },
    {
        id: 4,
        title: "Arquitetura do Sagrado",
        category: "Arte & Fé",
        duration: "6 semanas",
        image: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=1000",
        description: "A relação entre o espaço físico e a experiência transcendente.",
        available: false
    }
];

function CourseCard({ course, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className="group relative h-[600px] cursor-pointer"
        >
            <Card className="h-full border-none overflow-hidden rounded-3xl bg-transparent">
                <div className="absolute inset-0 z-0 scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>

                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
                    <div className="mb-6 flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.3em] font-bold px-3 py-1 bg-background/60 backdrop-blur-md border-spiritual-gold/20 text-spiritual-gold">
                            {course.category}
                        </Badge>
                        {!course.available && (
                            <div className="flex items-center gap-2 text-white/40">
                                <Lock className="w-3 h-3" />
                                <span className="text-[9px] uppercase tracking-widest font-bold">Em Breve</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-3xl font-serif text-white mb-4 group-hover:text-spiritual-gold transition-colors duration-500">
                        {course.title}
                    </h3>

                    <p className="text-sm text-white/50 mb-8 max-w-[80%] h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 line-clamp-2">
                        {course.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/10 pt-6">
                        <div className="flex items-center gap-2 text-white/60">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest">{course.duration}</span>
                        </div>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="w-10 h-10 rounded-full group-hover:bg-primary transition-all duration-500"
                        >
                            <ArrowRight className="w-4 h-4 group-hover:text-primary-foreground transition-colors" />
                        </Button>
                    </div>
                </div>

                <div className="absolute inset-0 border border-white/5 group-hover:border-spiritual-gold/30 rounded-3xl transition-colors duration-500 pointer-events-none" />
            </Card>
        </motion.div>
    );
}

export default function CourseGrid() {
    return (
        <section id="ensino" className="py-32 px-8 overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-8 h-[1px] bg-spiritual-gold"></span>
                            <span className="text-spiritual-gold uppercase tracking-[0.4em] text-[10px] font-bold">Currículo</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-serif leading-tight">
                            Caminhos para o <br />
                            <span className="italic opacity-80">Conhecimento Sagrado</span>
                        </h2>
                    </div>
                    <div className="flex flex-col gap-4 text-right">
                        <p className="text-white/40 text-sm max-w-sm ml-auto">
                            Transforme sua percepção através de módulos desenhados para a revelação do seu propósito real.
                        </p>
                        <Button
                            variant="link"
                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-spiritual-gold hover:text-white transition-colors ml-auto group p-0 h-auto"
                        >
                            Ver todos os caminhos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {courses.map((course, i) => (
                        <CourseCard key={course.id} course={course} index={i} />
                    ))}
                </div>

                {/* Visual anchor / decoration */}
                <div className="mt-32 flex items-center justify-center gap-12 opacity-20">
                    <Sparkles className="w-4 h-4 text-spiritual-gold" />
                    <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                    <Sparkles className="w-4 h-4 text-spiritual-gold" />
                </div>
            </div>
        </section>
    );
}
