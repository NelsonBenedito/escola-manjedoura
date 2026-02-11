import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden px-8">
            {/* Background Image with Layered Shadows */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2600"
                    alt="Silent contemplation"
                    className="w-full h-full object-cover scale-110 motion-safe:animate-slow-zoom"
                />
                {/* Heavy vignette and depth gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(18,18,18,0.8)_100%)]"></div>
            </div>

            <div className="container relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="flex flex-col items-center text-center max-w-6xl"
                >
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-spiritual-gold uppercase tracking-[0.6em] text-[10px] sm:text-xs mb-10 font-bold"
                    >
                        Revelando Propósitos • 2026
                    </motion.span>

                    <h1 className="text-6xl sm:text-7xl lg:text-9xl mb-12 leading-[1.1] flex flex-col items-center">
                        <span className="block opacity-90">Encontre seu</span>
                        <span className="italic font-serif text-spiritual-gold">Propósito Real</span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 1, duration: 1.5 }}
                        className="text-base sm:text-lg max-w-2xl font-light leading-relaxed tracking-wide mb-16"
                    >
                        Assim como a manjedoura revelou ao mundo a realeza de um Rei, estamos aqui para ajudar você a descobrir e honrar o propósito para o qual nasceu.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="flex flex-col sm:flex-row gap-6 items-center"
                    >
                        <Button
                            size="lg"
                            className="px-12 py-7 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-500"
                        >
                            Iniciar Jornada
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-12 py-7 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold backdrop-blur-sm border-white/10 hover:border-spiritual-gold/50 transition-all duration-500"
                        >
                            Conhecer a Escola
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute left-10 bottom-20 hidden xl:block vertical-text">
                <span className="text-spiritual-white/10 text-9xl font-serif tracking-tighter select-none">SILENCE</span>
            </div>

            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block space-y-20">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-[1px] h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent ${i === 1 ? 'opacity-100' : 'opacity-20'}`}></div>
                ))}
            </div>

            <style>{`
                @keyframes slow-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s ease-in-out infinite alternate;
                }
            `}</style>
        </section>
    );
}
