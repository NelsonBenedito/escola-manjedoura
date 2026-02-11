import React, { useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import CourseGrid from './components/CourseGrid'
import { motion } from 'framer-motion'
import { Instagram, Youtube, Facebook, ArrowUpRight, Sparkles } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import logo from './assets/ManjedouraLogoWhite.png'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/aulas');
    }
  }, [user, loading, navigate]);

  return (
    <div className="relative min-h-screen selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      {/* Aesthetic Overlays */}
      <div className="noise-overlay"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(197,179,88,0.03)_0%,transparent_50%)] pointer-events-none"></div>

      <Header />

      <main>
        <Hero />

        {/* Mission Statement Section */}
        <section className="py-40 px-8 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-spiritual-gold text-4xl block mb-12">❦</span>
              <h2 className="text-4xl md:text-5xl font-serif italic leading-relaxed mb-12">
                "Os reis não foram à manjedoura para ver um menino, mas para <span className="text-spiritual-gold">honrar um Rei</span> e testemunhar o propósito manifestado."
              </h2>
              <Separator className="w-24 bg-white/20 mx-auto mb-10" />
              <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold">Princípio da Honra</p>
            </motion.div>
          </div>
        </section>

        <CourseGrid />

        {/* Community / Newsletter Section */}
        <section className="py-40 px-8 relative overflow-hidden bg-secondary/10">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-primary/5 to-transparent"></div>

          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
                Prepare o <br />
                <span className="italic opacity-80 text-spiritual-gold">Lugar de Honra</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-lg">
                Junte-se à jornada de descoberta e revelação de propósitos. A honra começa onde o propósito é revelado.
              </p>

              <form className="flex flex-col sm:flex-row gap-4 p-2 bg-background/40 border border-white/5 rounded-full max-w-xl backdrop-blur-3xl" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="seu@espaco.com"
                  className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-sm font-medium focus-visible:ring-0"
                />
                <Button className="px-10 py-6 bg-spiritual-gold text-spiritual-dark font-bold uppercase tracking-widest text-[11px] rounded-full hover:bg-spiritual-sand transition-colors">
                  Inscrever-se
                </Button>
              </form>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              {[
                { title: 'Meditação Diária', icon: <Sparkles className="w-4 h-4" /> },
                { title: 'Círculos de Oração', icon: <Sparkles className="w-4 h-4" /> },
                { title: 'Bibliotecas do Ser', icon: <Sparkles className="w-4 h-4" /> },
                { title: 'Encontros Presenciais', icon: <Sparkles className="w-4 h-4" /> }
              ].map((item, i) => (
                <div key={i} className="p-10 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group flex flex-col justify-between aspect-square">
                  <div className="text-spiritual-gold group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h4 className="text-xl font-serif group-hover:text-spiritual-gold transition-colors">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-8 border-t border-white/5 bg-background">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logo} alt="Manjedoura Logo" className="h-10 w-auto opacity-80" />
            <p className="text-muted-foreground text-xs max-w-xs text-center md:text-left">
              Revelando propósitos reais através da honra e do conhecimento.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <Button variant="ghost" size="icon" asChild className="hover:text-spiritual-gold transition-colors">
              <a href="#"><Instagram className="w-5 h-5" /></a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hover:text-spiritual-gold transition-colors">
              <a href="#"><Youtube className="w-5 h-5" /></a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hover:text-spiritual-gold transition-colors">
              <a href="#"><Facebook className="w-5 h-5" /></a>
            </Button>
          </div>

          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
            © 2026 • Design by Antigravity
          </span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
