import React from 'react';
import { useUploads } from '@/contexts/UploadContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function UploadProgressOverlay() {
    const { uploads, removeUpload } = useUploads();
    const [isMinimized, setIsMinimized] = React.useState(false);

    if (uploads.length === 0) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 right-6 w-80 z-50 pointer-events-none"
        >
            <div className="bg-spiritual-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
                <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-spiritual-gold animate-pulse"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-spiritual-gold">
                            {uploads.length === 1 ? 'Upload Ativo' : `${uploads.length} Uploads`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white/40 hover:text-white"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="max-h-64 overflow-y-auto"
                        >
                            {uploads.map((upload) => (
                                <div key={upload.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start justify-between mb-2 gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{upload.title}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-wider">
                                                {upload.status === 'compressing' ? 'Comprimindo...' :
                                                    upload.status === 'uploading' ? 'Enviando...' :
                                                        upload.status === 'completed' ? 'Concluído' : 'Erro'}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            {upload.status === 'completed' ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : upload.status === 'error' ? (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <Loader2 className="w-4 h-4 text-spiritual-gold animate-spin" />
                                            )}
                                        </div>
                                    </div>

                                    {upload.status !== 'completed' && upload.status !== 'error' && (
                                        <Progress value={upload.progress} className="h-1 bg-white/5" />
                                    )}

                                    {upload.status === 'completed' || upload.status === 'error' ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full mt-2 h-7 text-[10px] text-white/30 hover:text-white"
                                            onClick={() => removeUpload(upload.id)}
                                        >
                                            Fechar
                                        </Button>
                                    ) : null}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
