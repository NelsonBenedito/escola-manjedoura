import React, { useState, useEffect } from 'react';
import Header from './Header';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
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
    CheckCircle2,
    FileUp,
    FileText
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit2, X, Check } from 'lucide-react';
export default function AdminDashboard() {
    const { user, profile } = useAuth();
    const { startUpload, uploads } = useUploads();
    const isUploading = uploads.length > 0;
    const [students, setStudents] = useState([]);
    const [modules, setModules] = useState([]);
    const [allLessons, setAllLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [searchTerm, setSearchTerm] = useState('');

    // Upload States
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDuration, setLessonDuration] = useState('');
    const [lessonModule, setLessonModule] = useState('');
    const [isAuthor, setIsAuthor] = useState(true);
    const [manualInstructor, setManualInstructor] = useState('');
    const [isNewModule, setIsNewModule] = useState(false);
    const [newModuleName, setNewModuleName] = useState('');

    // Module States
    const [editingModule, setEditingModule] = useState(null);
    const [editModuleName, setEditModuleName] = useState('');
    const [isCreatingModuleModalOpen, setIsCreatingModuleModalOpen] = useState(false);
    const [newModuleFormName, setNewModuleFormName] = useState('');
    const [moduleToDelete, setModuleToDelete] = useState(null);

    // Lesson States
    const [editingLesson, setEditingLesson] = useState(null);
    const [editLessonData, setEditLessonData] = useState({
        title: '',
        description: '',
        instructor: '',
        pdfFile: null,
        currentPdfUrl: null
    });
    const [lessonToDelete, setLessonToDelete] = useState(null);

    const [stats, setStats] = useState([
        { label: 'Total de Alunos', value: '0', icon: <Users className="w-5 h-5 text-spiritual-gold" />, detail: 'Carregando...' },
        { label: 'Aulas Ativas', value: '0', icon: <BookOpen className="w-5 h-5 text-spiritual-gold" />, detail: 'Carregando...' },
    ]);

    const fetchData = async () => {
        try {
            // 1. Fetch modules
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select('*')
                .order('order_index', { ascending: true });

            if (modulesError) throw modulesError;

            // 2. Fetch all lessons for management
            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .order('created_at', { ascending: false });

            if (lessonsError) throw lessonsError;
            setAllLessons(lessonsData || []);

            // 3. Enrich modules with lesson counts and total duration
            const counts = (lessonsData || []).reduce((acc, curr) => {
                const moduleName = curr.module || 'Sem Módulo';
                if (!acc[moduleName]) acc[moduleName] = { count: 0, duration: 0 };
                acc[moduleName].count += 1;
                acc[moduleName].duration += (parseInt(curr.duration) || 0);
                return acc;
            }, {});

            const enrichedModules = (modulesData || []).map(m => ({
                ...m,
                lessons: counts[m.title]?.count || 0,
                totalDuration: counts[m.title]?.duration || 0
            }));
            setModules(enrichedModules);

            // 4. Fetch profiles with their roles from user_roles table
            const { data: studentsData, error: studentsError } = await supabase
                .from('profiles')
                .select('*, user_roles(role_id)')
                .order('updated_at', { ascending: false });

            if (studentsError) throw studentsError;

            // Flatten roles for easier use in frontend safely
            const flattenedStudents = (studentsData || []).map(s => {
                const rolesData = s.user_roles;
                const roleArray = Array.isArray(rolesData)
                    ? rolesData.map(ur => ur.role_id)
                    : (rolesData?.role_id ? [rolesData.role_id] : ['student']);

                return {
                    ...s,
                    role: roleArray
                };
            });

            setStudents(flattenedStudents);

            if (enrichedModules.length > 0 && !lessonModule) {
                setLessonModule(enrichedModules[0].title);
            }

            // Update stats
            setStats([
                { label: 'Total de Alunos', value: studentsData?.length.toString() || '0', icon: <Users className="w-5 h-5 text-spiritual-gold" />, detail: 'Membros registrados' },
                { label: 'Aulas Ativas', value: lessonsData?.length.toString() || '0', icon: <BookOpen className="w-5 h-5 text-spiritual-gold" />, detail: `${enrichedModules.length} módulos ativos` },
                { label: 'Conclusões', value: '89%', icon: <CheckCircle2 className="w-5 h-5 text-spiritual-gold" />, detail: 'Taxa de retenção' },
                { label: 'Horas Totais', value: '1,2k', icon: <Clock className="w-5 h-5 text-spiritual-gold" />, detail: 'Conteúdo assistido' },
            ]);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            toast.error('Erro ao carregar dados do servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRenameModule = async () => {
        if (!editModuleName || editModuleName === editingModule.title) {
            setEditingModule(null);
            return;
        }

        try {
            // 1. Update the module record
            const { error: moduleError } = await supabase
                .from('modules')
                .update({ title: editModuleName })
                .eq('title', editingModule.title);

            if (moduleError) throw moduleError;

            // 2. Update all associated lessons
            const { error: lessonsError } = await supabase
                .from('lessons')
                .update({ module: editModuleName })
                .eq('module', editingModule.title);

            if (lessonsError) throw lessonsError;

            toast.success(`Módulo renomeado para "${editModuleName}"`);
            setEditingModule(null);
            fetchData();
        } catch (err) {
            console.error("Error renaming module:", err);
            toast.error("Erro ao renomear módulo");
        }
    };

    const handleCreateModule = async () => {
        if (!newModuleFormName) return;

        try {
            const { error } = await supabase
                .from('modules')
                .insert({
                    title: newModuleFormName,
                    state: 'public'
                });

            if (error) throw error;

            toast.success(`Módulo "${newModuleFormName}" criado com sucesso!`);
            setIsCreatingModuleModalOpen(false);
            setNewModuleFormName('');

            // Set as current module for upload and scroll
            setLessonModule(newModuleFormName);
            fetchData();

            setTimeout(() => {
                const uploadSection = document.getElementById('quick-upload-section');
                if (uploadSection) {
                    uploadSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);

        } catch (err) {
            console.error("Error creating module:", err);
            toast.error("Erro ao criar módulo: " + (err.message || "Nome já existe?"));
        }
    };

    const handleDeleteModule = (moduleTitle) => {
        setModuleToDelete(moduleTitle);
    };

    const confirmDeleteModule = async () => {
        if (!moduleToDelete) return;

        try {
            // 2. Delete all associated lessons first (or let cascade handle if setup)
            const { error: lessonsError } = await supabase
                .from('lessons')
                .delete()
                .eq('module', moduleToDelete);

            if (lessonsError) throw lessonsError;

            // 1. Delete the module record
            const { error: moduleError } = await supabase
                .from('modules')
                .delete()
                .eq('title', moduleToDelete);

            if (moduleError) throw moduleError;

            toast.success("Módulo e todas as suas aulas foram excluídos");
            setModuleToDelete(null);
            fetchData();
        } catch (err) {
            console.error("Error deleting module:", err);
            toast.error("Erro ao excluir módulo");
        }
    };

    const handleUpdateLesson = async () => {
        if (!editingLesson || !editLessonData.title) return;

        try {
            let pdfUrl = editLessonData.currentPdfUrl;

            // If a new PDF file was selected, upload it
            if (editLessonData.pdfFile) {
                const id = Math.random().toString(36).substring(7);
                const pdfExt = editLessonData.pdfFile.name.split('.').pop();
                const pdfFileName = `${Date.now()}-edit-doc-${id}.${pdfExt}`;
                const pdfPath = `materials/${pdfFileName}`;

                const { error: pdfUploadError } = await supabase.storage
                    .from('content')
                    .upload(pdfPath, editLessonData.pdfFile, {
                        contentType: 'application/pdf',
                        cacheControl: '3600',
                        upsert: false
                    });

                if (pdfUploadError) throw pdfUploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('content')
                    .getPublicUrl(pdfPath);

                pdfUrl = publicUrl;
            }

            const { error } = await supabase
                .from('lessons')
                .update({
                    title: editLessonData.title,
                    description: editLessonData.description,
                    instructor: editLessonData.instructor,
                    pdf_url: pdfUrl
                })
                .eq('id', editingLesson.id);

            if (error) throw error;

            toast.success("Aula atualizada com sucesso!");
            setEditingLesson(null);
            fetchData();
        } catch (err) {
            console.error("Error updating lesson:", err);
            toast.error("Erro ao atualizar aula");
        }
    };

    const confirmDeleteLesson = async () => {
        if (!lessonToDelete) return;

        try {
            const { error } = await supabase
                .from('lessons')
                .delete()
                .eq('id', lessonToDelete.id);

            if (error) throw error;

            toast.success(`Aula "${lessonToDelete.title}" excluída`);
            setLessonToDelete(null);
            fetchData();
        } catch (err) {
            console.error("Error deleting lesson:", err);
            toast.error("Erro ao excluir aula");
        }
    };

    const handleToggleUserRole = async (studentId, roleToToggle) => {
        // Role check (needs to look at the new array structure or backward compatibility)
        const isAdmin = Array.isArray(profile?.role) ? profile.role.includes('admin') : profile?.role === 'admin';
        if (!isAdmin) {
            toast.error("Apenas administradores podem alterar cargos");
            return;
        }

        if (studentId === user.id && roleToToggle === 'admin') {
            toast.error("Você não pode remover seu próprio cargo de Administrador");
            return;
        }

        const student = students.find(s => s.id === studentId);
        let currentRoles = Array.isArray(student?.role) ? student.role : ['student'];
        const isActive = currentRoles.includes(roleToToggle);

        // Optimistic update
        const newRoles = isActive
            ? currentRoles.filter(r => r !== roleToToggle)
            : [...currentRoles, roleToToggle];

        if (newRoles.length === 0) {
            toast.error("O usuário deve ter pelo menos um cargo");
            return;
        }

        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, role: newRoles } : s));

        try {
            if (isActive) {
                // Delete from junction table
                const { error } = await supabase
                    .from('user_roles')
                    .delete()
                    .eq('user_id', studentId)
                    .eq('role_id', roleToToggle);
                if (error) throw error;
            } else {
                // Insert into junction table
                const { error } = await supabase
                    .from('user_roles')
                    .insert({ user_id: studentId, role_id: roleToToggle });
                if (error) throw error;
            }

            toast.success("Cargos atualizados");
            fetchData();
        } catch (err) {
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, role: currentRoles } : s));
            console.error("Error updating roles:", err);
            toast.error("Erro ao atualizar cargos no banco de dados");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            // Se for vídeo, extrair a duração automaticamente
            if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    window.URL.revokeObjectURL(video.src);
                    const durationInMinutes = Math.ceil(video.duration / 60);
                    setLessonDuration(durationInMinutes.toString());
                };
                video.src = URL.createObjectURL(file);
            } else {
                toast.info(`Arquivo selecionado: ${file.name}`);
            }
        }
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedPdf(file);
            toast.success(`PDF selecionado: ${file.name}`);
        } else if (file) {
            toast.error("Por favor, selecione um arquivo PDF válido");
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
            pdfFile: selectedPdf,
            title: lessonTitle,
            duration: lessonDuration,
            module: isNewModule ? newModuleName : lessonModule,
            instructor: isAuthor ? (profile?.full_name || 'Admin') : (manualInstructor || 'Autor Desconhecido'),
            userId: user.id,
            onComplete: () => {
                setSelectedFile(null);
                setSelectedPdf(null);
                setLessonTitle('');
                setLessonDuration('');
                setManualInstructor('');
                setIsAuthor(true);
                if (isNewModule) {
                    setIsNewModule(false);
                    setNewModuleName('');
                }
                // Refresh data
                fetchData();
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
                        {(Array.isArray(profile?.role) ? profile.role.includes('admin') : profile?.role === 'admin') && (
                            <TabsTrigger value="students" className="rounded-full px-8 py-3 text-xs uppercase tracking-widest data-[state=active]:bg-spiritual-gold data-[state=active]:text-spiritual-dark">
                                Alunos
                            </TabsTrigger>
                        )}
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
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                            ) : students.filter(s =>
                                                (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                                            ).length > 0 ? (
                                                students
                                                    .filter(s =>
                                                        (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((student) => (
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
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {(Array.isArray(student.role) ? student.role : [student.role || 'student']).map(r => (
                                                                        <Badge key={r} variant="secondary" className={cn(
                                                                            "rounded-full px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold",
                                                                            r === 'admin' ? "bg-spiritual-gold/10 text-spiritual-gold border-spiritual-gold/20" :
                                                                                r === 'instructor' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                                                    "bg-white/5 text-muted-foreground border-white/10"
                                                                        )}>
                                                                            {r === 'admin' ? 'Admin' : r === 'instructor' ? 'Instrutor' : 'Aluno'}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="p-6 text-xs text-muted-foreground">
                                                                {student.updated_at ? new Date(student.updated_at).toLocaleDateString('pt-BR') : 'Sem dados'}
                                                            </td>
                                                            <td className="p-6 pr-12">
                                                                <div className="flex items-center gap-1.5">
                                                                    {[
                                                                        { id: 'student', label: 'ALU' },
                                                                        { id: 'instructor', label: 'INS' },
                                                                        { id: 'admin', label: 'ADM' }
                                                                    ].map(role => {
                                                                        const roles = Array.isArray(student.role) ? student.role : [student.role || 'student'];
                                                                        const isActive = roles.includes(role.id);
                                                                        return (
                                                                            <button
                                                                                key={role.id}
                                                                                onClick={() => handleToggleUserRole(student.id, role.id)}
                                                                                disabled={student.id === user.id && role.id === 'admin'}
                                                                                className={cn(
                                                                                    "w-8 h-8 rounded-lg text-[9px] font-bold transition-all border outline-none",
                                                                                    isActive
                                                                                        ? "bg-spiritual-gold border-spiritual-gold text-spiritual-dark"
                                                                                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                                                                                )}
                                                                                title={role.id}
                                                                            >
                                                                                {role.label}
                                                                            </button>
                                                                        );
                                                                    })}
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
                                        <Button
                                            onClick={() => {
                                                setIsNewModule(true);
                                                window.scrollTo({ top: 500, behavior: 'smooth' });
                                                setTimeout(() => {
                                                    document.querySelector('input[placeholder="Nome do novo módulo"]')?.focus();
                                                }, 500);
                                            }}
                                            className="bg-spiritual-gold text-spiritual-dark font-bold uppercase tracking-widest text-[10px] rounded-full px-6 hover:bg-spiritual-sand shadow-lg shadow-spiritual-gold/10"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Novo Módulo
                                        </Button>
                                        <Button variant="outline" className="border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold hover:border-spiritual-gold/50">
                                            Reordenar
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {loading ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />
                                        ))
                                    ) : modules.length > 0 ? (
                                        modules.map((module, i) => (
                                            <div key={i} className="flex flex-col gap-2">
                                                <div className="p-6 bg-white/2 border border-white/5 rounded-3xl hover:border-white/10 transition-all flex items-center justify-between group">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 rounded-2xl bg-spiritual-gold/10 flex items-center justify-center text-spiritual-gold">
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-serif">{module.title}</h3>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                                                {module.lessons} Aulas • {module.totalDuration} min • {module.state === 'public' ? 'Publicado' : 'Rascunho'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {profile?.role?.includes('admin') && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-full">
                                                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-spiritual-dark border-white/10 text-white rounded-xl min-w-[160px]">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setEditingModule(module);
                                                                        setEditModuleName(module.title);
                                                                    }}
                                                                    className="focus:bg-white/5 focus:text-spiritual-gold cursor-pointer gap-2"
                                                                >
                                                                    <Edit2 className="w-4 h-4" /> Renomear
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-white/5" />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteModule(module.title)}
                                                                    className="focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer gap-2"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Excluir Módulo
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>

                                                {/* Lessons in this module */}
                                                <div className="pl-12 space-y-2 mb-6 transition-all">
                                                    {allLessons
                                                        .filter(lesson => lesson.module === module.title)
                                                        .map(lesson => (
                                                            <div key={lesson.id} className="p-4 bg-white/2 border border-white/2 rounded-2xl flex items-center justify-between group/lesson">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                                                                        <Play className="w-3 h-3" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium">{lesson.title}</p>
                                                                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{lesson.duration || 0} MIN</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    {(profile?.role?.includes('admin') || (profile?.role?.includes('instructor') && lesson.instructor === profile?.full_name)) && (
                                                                        <>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => {
                                                                                    setEditingLesson(lesson);
                                                                                    setEditLessonData({
                                                                                        title: lesson.title,
                                                                                        description: lesson.description || '',
                                                                                        instructor: lesson.instructor || '',
                                                                                        pdfFile: null,
                                                                                        currentPdfUrl: lesson.pdf_url || null
                                                                                    });
                                                                                }}
                                                                                className="h-8 w-8 rounded-full hover:bg-spiritual-gold/10 hover:text-spiritual-gold"
                                                                            >
                                                                                <Edit2 className="w-3 h-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => setLessonToDelete(lesson)}
                                                                                className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-muted-foreground italic border border-dashed border-white/5 rounded-3xl">
                                            Nenhum módulo encontrado.
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setIsCreatingModuleModalOpen(true)}
                                        className="w-full p-8 border-2 border-dashed border-white/5 rounded-3xl text-muted-foreground hover:border-spiritual-gold/30 hover:text-spiritual-gold transition-all text-sm font-medium flex items-center justify-center gap-3">
                                        <Plus className="w-4 h-4" /> Criar Novo Módulo via Upload
                                    </button>
                                </div>
                            </Card>

                            <Card id="quick-upload-section" className="bg-secondary/5 border-white/5 rounded-[2rem] p-12">
                                <h2 className="text-2xl font-serif mb-8">Upload Rápido</h2>
                                <div className="space-y-8">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="video/*,image/*"
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={cn(
                                            "p-12 border-2 border-dashed border-white/10 rounded-3xl bg-white/2 flex flex-col items-center text-center group transition-all",
                                            isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-spiritual-gold/50"
                                        )}
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

                                    {/* PDF Attachment Section */}
                                    <div className="space-y-4">
                                        <input
                                            type="file"
                                            id="pdf-upload"
                                            className="hidden"
                                            onChange={handlePdfChange}
                                            accept=".pdf"
                                            disabled={isUploading}
                                        />
                                        <label
                                            htmlFor="pdf-upload"
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all",
                                                isUploading ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                                                selectedPdf
                                                    ? "bg-spiritual-gold/5 border-spiritual-gold/30 text-spiritual-gold"
                                                    : "bg-white/2 border-white/5 hover:border-white/20 text-muted-foreground"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                selectedPdf ? "bg-spiritual-gold/20" : "bg-white/5"
                                            )}>
                                                <FileUp className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5">Material de Estudo (PDF)</p>
                                                <p className="text-xs truncate">
                                                    {selectedPdf ? selectedPdf.name : "Clique para anexar um arquivo PDF"}
                                                </p>
                                            </div>
                                            {selectedPdf && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-spiritual-gold/20"
                                                    disabled={isUploading}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedPdf(null);
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </label>
                                    </div>

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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Título da Aula</Label>
                                                <Input
                                                    placeholder="Ex: O Código da Manjedoura"
                                                    className="bg-white/5 border-white/10 rounded-2xl h-14"
                                                    value={lessonTitle}
                                                    disabled={isUploading}
                                                    onChange={(e) => setLessonTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Duração (minutos)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Ex: 45"
                                                    className="bg-white/5 border-white/10 rounded-2xl h-14"
                                                    value={lessonDuration}
                                                    disabled={isUploading}
                                                    onChange={(e) => setLessonDuration(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Módulo</Label>
                                            {!isNewModule ? (
                                                <select
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 text-sm outline-none focus:border-spiritual-gold/50 disabled:opacity-50"
                                                    value={lessonModule}
                                                    disabled={isUploading}
                                                    onChange={(e) => {
                                                        if (e.target.value === 'NEW_MODULE') {
                                                            setIsNewModule(true);
                                                        } else {
                                                            setLessonModule(e.target.value);
                                                        }
                                                    }}
                                                >
                                                    {modules.map(m => (
                                                        <option key={m.title} value={m.title} className="bg-spiritual-dark">{m.title}</option>
                                                    ))}
                                                    <option value="NEW_MODULE" className="bg-spiritual-dark">+ Novo Módulo...</option>
                                                </select>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Input
                                                        className="bg-white/5 border-white/10 rounded-2xl h-12 flex-1"
                                                        placeholder="Nome do novo módulo"
                                                        value={newModuleName}
                                                        disabled={isUploading}
                                                        onChange={(e) => setNewModuleName(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setIsNewModule(false)}
                                                        disabled={isUploading}
                                                        className="rounded-2xl h-12 px-4 border border-white/10 hover:bg-white/5"
                                                    >
                                                        Voltar
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center gap-3 px-1">
                                                <div
                                                    onClick={() => !isUploading && setIsAuthor(!isAuthor)}
                                                    className={cn(
                                                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                                        isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                                                        isAuthor ? "bg-spiritual-gold border-spiritual-gold" : "bg-white/5 border-white/10"
                                                    )}
                                                >
                                                    {isAuthor && <Check className="w-3.5 h-3.5 text-spiritual-dark stroke-[3px]" />}
                                                </div>
                                                <Label
                                                    onClick={() => !isUploading && setIsAuthor(!isAuthor)}
                                                    className={cn(
                                                        "text-[11px] uppercase tracking-wider opacity-80",
                                                        isUploading ? "cursor-not-allowed" : "cursor-pointer"
                                                    )}
                                                >
                                                    Eu sou o autor deste vídeo
                                                </Label>
                                            </div>

                                            {!isAuthor && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-2"
                                                >
                                                    <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Nome do Autor</Label>
                                                    <Input
                                                        placeholder="Ex: Pr. Nelson Benedito"
                                                        className="bg-white/5 border-white/10 rounded-2xl h-14"
                                                        value={manualInstructor}
                                                        disabled={isUploading}
                                                        onChange={(e) => setManualInstructor(e.target.value)}
                                                    />
                                                </motion.div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={!selectedFile || isUploading}
                                            className="w-full bg-spiritual-gold text-spiritual-dark font-bold uppercase tracking-widest text-[11px] rounded-full py-6 h-auto hover:bg-spiritual-sand mt-4 disabled:opacity-50"
                                        >
                                            {isUploading ? "Enviando..." : "Iniciar Upload"}
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

            {/* Rename Modal Overlay */}
            {editingModule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditingModule(null)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-spiritual-dark border border-white/10 rounded-[2rem] p-10 max-w-lg w-full shadow-2xl"
                    >
                        <h3 className="text-2xl font-serif mb-2">Renomear Módulo</h3>
                        <p className="text-muted-foreground text-sm mb-8">Essa alteração afetará todas as aulas vinculadas a este módulo.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Novo Nome</Label>
                                <Input
                                    value={editModuleName}
                                    onChange={(e) => setEditModuleName(e.target.value)}
                                    placeholder="Ex: Fundamentos Avançados"
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-lg"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameModule()}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingModule(null)}
                                    className="flex-1 rounded-full py-6 h-auto border-white/10 hover:bg-white/5 gap-2"
                                >
                                    <X className="w-4 h-4" /> Cancelar
                                </Button>
                                <Button
                                    onClick={handleRenameModule}
                                    className="flex-1 bg-spiritual-gold text-spiritual-dark font-bold rounded-full py-6 h-auto hover:bg-spiritual-sand gap-2"
                                >
                                    <Check className="w-4 h-4" /> Salvar Alteração
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Create Module Modal */}
            {isCreatingModuleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCreatingModuleModalOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-spiritual-dark border border-white/10 rounded-[2rem] p-10 max-w-lg w-full shadow-2xl"
                    >
                        <h3 className="text-2xl font-serif mb-2">Criar Novo Módulo</h3>
                        <p className="text-muted-foreground text-sm mb-8">Defina o nome do módulo. Ele aparecerá na sua lista e você poderá adicionar aulas a ele imediatamente.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Nome do Módulo</Label>
                                <Input
                                    value={newModuleFormName}
                                    onChange={(e) => setNewModuleFormName(e.target.value)}
                                    placeholder="Ex: A Ciência da Gratidão"
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-lg"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateModule()}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreatingModuleModalOpen(false)}
                                    className="flex-1 rounded-full py-6 h-auto border-white/10 hover:bg-white/5 gap-2"
                                >
                                    <X className="w-4 h-4" /> Cancelar
                                </Button>
                                <Button
                                    onClick={handleCreateModule}
                                    className="flex-1 bg-spiritual-gold text-spiritual-dark font-bold rounded-full py-6 h-auto hover:bg-spiritual-sand gap-2"
                                >
                                    <Check className="w-4 h-4" /> Criar e Continuar
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {moduleToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setModuleToDelete(null)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-spiritual-dark border border-red-500/20 rounded-[2rem] p-10 max-w-lg w-full shadow-2xl"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                            <Trash2 className="w-8 h-8" />
                        </div>

                        <h3 className="text-2xl font-serif mb-2">Excluir Módulo?</h3>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                            Você está prestes a excluir o módulo <span className="text-white font-bold">"{moduleToDelete}"</span>.
                            Esta ação é irreversível e irá remover <span className="text-red-400 font-bold underline">todas as aulas</span> vinculadas a este módulo.
                        </p>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setModuleToDelete(null)}
                                className="flex-1 rounded-full py-6 h-auto border-white/10 hover:bg-white/5 gap-2"
                            >
                                <X className="w-4 h-4" /> Cancelar
                            </Button>
                            <Button
                                onClick={confirmDeleteModule}
                                className="flex-1 bg-red-600 text-white font-bold rounded-full py-6 h-auto hover:bg-red-700 gap-2 shadow-lg shadow-red-900/20"
                            >
                                <Trash2 className="w-4 h-4" /> Confirmar Exclusão
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Lesson Modal */}
            {editingLesson && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setEditingLesson(null)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-spiritual-dark border border-white/10 rounded-[2rem] p-10 max-w-2xl w-full shadow-2xl"
                    >
                        <h3 className="text-2xl font-serif mb-2">Editar Aula</h3>
                        <p className="text-muted-foreground text-sm mb-8">Altere os detalhes desta aula para os alunos.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Título da Aula</Label>
                                <Input
                                    value={editLessonData.title}
                                    onChange={(e) => setEditLessonData({ ...editLessonData, title: e.target.value })}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-lg"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Nome do Instrutor / Autor</Label>
                                <Input
                                    value={editLessonData.instructor}
                                    onChange={(e) => setEditLessonData({ ...editLessonData, instructor: e.target.value })}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14"
                                    placeholder="Ex: Pr. Nelson Benedito"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Descrição</Label>
                                <textarea
                                    value={editLessonData.description}
                                    onChange={(e) => setEditLessonData({ ...editLessonData, description: e.target.value })}
                                    className="w-full min-h-[120px] bg-white/5 border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-spiritual-gold/50 transition-all resize-none"
                                    placeholder="Descreva o conteúdo desta aula..."
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase tracking-widest ml-1 opacity-60">Material de Apoio (PDF)</Label>
                                <input
                                    type="file"
                                    id="edit-pdf-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.type === 'application/pdf') {
                                            setEditLessonData({ ...editLessonData, pdfFile: file });
                                            toast.success(`Novo PDF selecionado`);
                                        }
                                    }}
                                    accept=".pdf"
                                />
                                <label
                                    htmlFor="edit-pdf-upload"
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                                        (editLessonData.pdfFile || editLessonData.currentPdfUrl)
                                            ? "bg-spiritual-gold/5 border-spiritual-gold/30 text-spiritual-gold"
                                            : "bg-white/2 border-white/5 hover:border-white/20 text-muted-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        (editLessonData.pdfFile || editLessonData.currentPdfUrl) ? "bg-spiritual-gold/20" : "bg-white/5"
                                    )}>
                                        <FileUp className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs truncate">
                                            {editLessonData.pdfFile ? editLessonData.pdfFile.name : (editLessonData.currentPdfUrl ? "PDF já anexado (Clique para trocar)" : "Clique para anexar um arquivo PDF")}
                                        </p>
                                    </div>
                                    {(editLessonData.pdfFile || editLessonData.currentPdfUrl) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:bg-spiritual-gold/20"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setEditLessonData({ ...editLessonData, pdfFile: null, currentPdfUrl: null });
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingLesson(null)}
                                    className="flex-1 rounded-full py-6 h-auto border-white/10 hover:bg-white/5 gap-2"
                                >
                                    <X className="w-4 h-4" /> Cancelar
                                </Button>
                                <Button
                                    onClick={handleUpdateLesson}
                                    className="flex-1 bg-spiritual-gold text-spiritual-dark font-bold rounded-full py-6 h-auto hover:bg-spiritual-sand gap-2"
                                >
                                    <Check className="w-4 h-4" /> Salvar Alterações
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Lesson Confirmation */}
            {lessonToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setLessonToDelete(null)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-spiritual-dark border border-red-500/20 rounded-[2rem] p-10 max-w-lg w-full shadow-2xl"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-serif mb-2">Excluir Aula?</h3>
                        <p className="text-muted-foreground text-sm mb-8">
                            Tem certeza que deseja excluir a aula <span className="text-white font-bold">"{lessonToDelete.title}"</span>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setLessonToDelete(null)} className="flex-1 rounded-full py-6 h-auto border-white/10">
                                Cancelar
                            </Button>
                            <Button onClick={confirmDeleteLesson} className="flex-1 bg-red-600 text-white font-bold rounded-full py-6 h-auto hover:bg-red-700">
                                Excluir Aula
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
