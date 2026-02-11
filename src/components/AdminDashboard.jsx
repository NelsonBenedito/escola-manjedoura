import React, { useState, useEffect } from 'react';
import Header from './Header';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    Upload,
    BarChart3,
    Plus,
    Search,
    MoreVertical,
    Play,
    Clock,
    ChevronRight,
    GraduationCap,
    CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContext';
import { useUploads } from '@/contexts/UploadContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Label } from './ui/label';
export default function AdminDashboard() {
    const { user, profile } = useAuth();
    const { startUpload, uploads } = useUploads();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [selectedFile, setSelectedFile] = useState(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonModule, setLessonModule] = useState('Fundamentos da Honra');

    // Mock data for initial states
    const [stats] = useState([
        { label: 'Total de Alunos', value: '124', icon: <Users className="w-5 h-5 text-spiritual-gold" />, detail: '+12 este mês' },
        { label: 'Aulas Ativas', value: '42', icon: <BookOpen className="w-5 h-5 text-spiritual-gold" />, detail: '10 módulos' },
        { label: 'Conclusões', value: '89%', icon: <CheckCircle2 className="w-5 h-5 text-spiritual-gold" />, detail: 'Taxa de retenção' },
        { label: 'Horas Totais', value: '1,2k', icon: <Clock className="w-5 h-5 text-spiritual-gold" />, detail: 'Conteúdo assistido' },
    ]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('updated_at', { ascending: false });

                if (error) throw error;
                setStudents(data || []);
            } catch (err) {
                console.error('Error fetching students:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            toast.info(`Arquivo selecionado: ${file.name}`);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Selecione um arquivo primeiro");
            return;
        }

        if (!lessonTitle) {
            toast.error("Digite o título da aula");
            return;
        }

        // Start global upload
        startUpload({
            file: selectedFile,
            title: lessonTitle,
            module: lessonModule,
            instructor: profile?.full_name || 'Admin',
            userId: user.id,
            onComplete: () => {
                setSelectedFile(null);
                setLessonTitle('');
            }
        });

        toast.success("Upload iniciado! Você pode navegar pelo site enquanto processamos.");
    };

    return (
        <div className="min-h-screen bg-spiritual-dark text-white font-sans selection:bg-spiritual-gold/20">
            <Header />

            <main className="max-w-[1400px] mx-auto px-8 pt-32 pb-20">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-serif mb-2">Painel de <span className="text-spiritual-gold italic">Gestão Real</span></h1>
                            <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">Administração do Projeto Manjedoura</p>
                        </div>
                        <Button
                            onClick={() => {
                                setActiveTab('lessons');
                                window.scrollTo({ top: 500, behavior: 'smooth' });
                            }}
                            className="bg-spiritual-gold text-spiritual-dark font-bold uppercase tracking-widest text-[11px] rounded-full px-8 py-6 h-auto hover:bg-spiritual-sand gap-3 shadow-lg shadow-spiritual-gold/10"
                        >
                            <Plus className="w-4 h-4" /> Nova Aula
                        </Button>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-secondary/5 border-white/5 rounded-3xl p-6 h-full flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        {stat.icon}
                                    </div>
                                    <span className="text-3xl font-serif">{stat.value}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-[10px] text-spiritual-gold/60 mt-1">{stat.detail}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-8"
                >
                    <TabsList className="bg-white/5 border border-white/5 rounded-full p-1 h-auto flex flex-wrap max-w-fit">
                        <TabsTrigger value="students" className="rounded-full px-8 py-3 text-xs uppercase tracking-widest data-[state=active]:bg-spiritual-gold data-[state=active]:text-spiritual-dark">
                            Alunos
                        </TabsTrigger>
                        <TabsTrigger value="lessons" className="rounded-full px-8 py-3 text-xs uppercase tracking-widest data-[state=active]:bg-spiritual-gold data-[state=active]:text-spiritual-dark">
                            Gerenciar Aulas
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="rounded-full px-8 py-3 text-xs uppercase tracking-widest data-[state=active]:bg-spiritual-gold data-[state=active]:text-spiritual-dark">
                            Relatórios
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="students" className="mt-0">
                        <Card className="bg-secondary/5 border-white/5 rounded-[2rem] overflow-hidden">
                            <CardHeader className="p-8 md:p-12 border-b border-white/5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <CardTitle className="text-2xl font-serif">Lista de Alunos Registrados</CardTitle>
                                        <CardDescription>Acompanhe quem faz parte da comunidade.</CardDescription>
                                    </div>
                                    <div className="relative w-full md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar aluno..."
                                            className="pl-12 bg-white/5 border-white/10 rounded-full h-12 focus:border-spiritual-gold/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/2 border-b border-white/5">
                                                <th className="p-6 pl-12 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Aluno</th>
                                                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Status</th>
                                                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Última Atividade</th>
                                                <th className="p-6 pr-12 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                Array(5).fill(0).map((_, i) => (
                                                    <tr key={i} className="border-b border-white/5 animate-pulse">
                                                        <td className="p-6 pl-12"><div className="h-10 w-40 bg-white/5 rounded-lg" /></td>
                                                        <td className="p-6"><div className="h-6 w-20 bg-white/5 rounded-lg" /></td>
                                                        <td className="p-6"><div className="h-4 w-32 bg-white/5 rounded-lg" /></td>
                                                        <td className="p-6 pr-12"><div className="h-8 w-8 bg-white/5 rounded-full" /></td>
                                                    </tr>
                                                ))
                                            ) : students.length > 0 ? (
                                                students.map((student) => (
                                                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                                        <td className="p-6 pl-12">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar className="w-10 h-10 border border-white/10">
                                                                    <AvatarImage src={student.avatar_url} crossOrigin="anonymous" />
                                                                    <AvatarFallback className="bg-primary text-xs">{student.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-medium">{student.full_name || 'Sem nome'}</p>
                                                                    <p className="text-[10px] text-muted-foreground">{student.email || 'Email oculto'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <Badge variant="secondary" className="bg-spiritual-gold/10 text-spiritual-gold border-spiritual-gold/20 rounded-full px-3 py-1 text-[9px] uppercase tracking-widest font-bold">
                                                                {student.role === 'admin' ? 'Administrador' : 'Aluno Ativo'}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-6 text-xs text-muted-foreground">
                                                            {student.updated_at ? new Date(student.updated_at).toLocaleDateString('pt-BR') : 'Sem dados'}
                                                        </td>
                                                        <td className="p-6 pr-12">
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="ghost" size="icon" className="hover:bg-white/5 rounded-full">
                                                                    <ChevronRight className="w-4 h-4 text-spiritual-gold" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="p-20 text-center text-muted-foreground italic">Nenhum aluno encontrado</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="lessons" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 bg-secondary/5 border-white/5 rounded-[2rem] p-8 md:p-12">
                                <div className="flex items-center justify-between mb-12">
                                    <h2 className="text-2xl font-serif">Módulos e Aulas</h2>
                                    <div className="flex gap-4">
                                        <Button variant="outline" className="border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold hover:border-spiritual-gold/50">
                                            Reordenar
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { title: 'Fundamentos da Honra', lessons: 5, state: 'public' },
                                        { title: 'A Jornada do Propósito', lessons: 8, state: 'public' },
                                        { title: 'Revelação e Destino', lessons: 4, state: 'draft' },
                                    ].map((module, i) => (
                                        <div key={i} className="p-6 bg-white/2 border border-white/5 rounded-3xl hover:border-white/10 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-spiritual-gold/10 flex items-center justify-center text-spiritual-gold">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-serif">{module.title}</h3>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{module.lessons} Aulas • {module.state === 'public' ? 'Publicado' : 'Rascunho'}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-full">
                                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                    <button className="w-full p-8 border-2 border-dashed border-white/5 rounded-3xl text-muted-foreground hover:border-spiritual-gold/30 hover:text-spiritual-gold transition-all text-sm font-medium flex items-center justify-center gap-3">
                                        <Plus className="w-4 h-4" /> Adicionar Novo Módulo
                                    </button>
                                </div>
                            </Card>

                            <Card className="bg-secondary/5 border-white/5 rounded-[2rem] p-12">
                                <h2 className="text-2xl font-serif mb-8">Upload Rápido</h2>
                                <div className="space-y-8">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="video/*,image/*"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="p-12 border-2 border-dashed border-white/10 rounded-3xl bg-white/2 flex flex-col items-center text-center group cursor-pointer hover:border-spiritual-gold/50 transition-all"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-spiritual-gold/10 flex items-center justify-center text-spiritual-gold mb-6 group-hover:scale-110 transition-transform">
                                            {uploads.length > 0 ? (
                                                <div className="relative w-8 h-8">
                                                    <div className="absolute inset-0 border-2 border-spiritual-gold/20 border-t-spiritual-gold rounded-full animate-spin"></div>
                                                </div>
                                            ) : (
                                                <Upload className="w-8 h-8" />
                                            )}
                                        </div>
                                        <p className="text-sm font-bold uppercase tracking-widest mb-2">
                                            {selectedFile ? selectedFile.name : "Clique ou Arraste"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {uploads.length > 0 ? `Processando ${uploads.length} aula(s)` : "Vídeos ou Imagens (Comprimidos no Navegador)"}
                                        </p>
                                    </label>

                                    {uploads.find(u => u.title === lessonTitle) && (
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-spiritual-gold"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploads.find(u => u.title === lessonTitle)?.progress || 0}%` }}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Título da Aula</Label>
                                            <Input
                                                className="bg-white/5 border-white/10 rounded-2xl h-12"
                                                placeholder="Ex: O Código da Manjedoura"
                                                value={lessonTitle}
                                                onChange={(e) => setLessonTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Módulo</Label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 text-sm outline-none focus:border-spiritual-gold/50"
                                                value={lessonModule}
                                                onChange={(e) => setLessonModule(e.target.value)}
                                            >
                                                <option className="bg-spiritual-dark">Fundamentos da Honra</option>
                                                <option className="bg-spiritual-dark">A Jornada do Propósito</option>
                                            </select>
                                        </div>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={!selectedFile}
                                            className="w-full bg-spiritual-gold text-spiritual-dark font-bold uppercase tracking-widest text-[11px] rounded-full py-6 h-auto hover:bg-spiritual-sand mt-4 disabled:opacity-50"
                                        >
                                            {"Iniciar Upload"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-0">
                        <Card className="bg-secondary/5 border-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <BarChart3 className="w-16 h-16 text-spiritual-gold/20 mb-6" />
                            <h2 className="text-2xl font-serif mb-4">Módulo de Business Intelligence</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Relatórios avançados de retenção, engajamento e conclusão por módulo em desenvolvimento para a próxima revelação.
                            </p>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
