import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage, compressVideo } from '@/lib/compression';
import { toast } from 'sonner';

const UploadContext = createContext();

export function UploadProvider({ children }) {
    const [uploads, setUploads] = useState([]);

    const startUpload = async ({ file, pdfFile, title, duration, module, instructor, userId, onComplete }) => {
        const id = Math.random().toString(36).substring(7);
        const newUpload = {
            id,
            title,
            progress: 0,
            status: 'compressing',
            type: file.type.startsWith('image/') ? 'image' : 'video'
        };

        setUploads(prev => [...prev, newUpload]);

        try {
            let fileToUpload = file;

            // 1. Compression
            if (newUpload.type === 'image') {
                fileToUpload = await compressImage(file);
            } else {
                fileToUpload = await compressVideo(file, (progress) => {
                    updateUploadProgress(id, progress, 'compressing');
                });
            }

            updateUploadProgress(id, 0, 'uploading');

            // 2. Storage Upload (Video/Image)
            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `${Date.now()}-${id}.${fileExt}`;
            const filePath = `lessons/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('content')
                .upload(filePath, fileToUpload, {
                    contentType: fileToUpload.type,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl: contentUrl } } = supabase.storage
                .from('content')
                .getPublicUrl(filePath);

            // 3. Upload PDF if exists
            let pdfUrl = null;
            if (pdfFile) {
                updateUploadProgress(id, 50, 'uploading_pdf');
                const pdfExt = pdfFile.name.split('.').pop();
                const pdfFileName = `${Date.now()}-doc-${id}.${pdfExt}`;
                const pdfPath = `materials/${pdfFileName}`;

                const { error: pdfUploadError } = await supabase.storage
                    .from('content')
                    .upload(pdfPath, pdfFile, {
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

            // 4. DB Insert
            const { error: dbError } = await supabase
                .from('lessons')
                .insert({
                    title,
                    module,
                    duration: duration ? parseInt(duration) : null,
                    video_url: contentUrl,
                    pdf_url: pdfUrl,
                    instructor: instructor || 'Admin',
                    created_by: userId
                });

            if (dbError) throw dbError;

            updateUploadProgress(id, 100, 'completed');
            toast.success(`Aula "${title}" publicada com sucesso!`);

            if (onComplete) onComplete();

            // Auto-remove from list after 5 seconds if completed
            setTimeout(() => {
                setUploads(prev => prev.filter(u => u.id !== id));
            }, 5000);

        } catch (error) {
            console.error("Global upload error:", error);
            updateUploadProgress(id, 0, 'error');
            toast.error(`Falha no upload de "${title}": ${error.message}`);
        }
    };

    const updateUploadProgress = (id, progress, status) => {
        setUploads(prev => prev.map(u =>
            u.id === id ? { ...u, progress, status } : u
        ));
    };

    const removeUpload = (id) => {
        setUploads(prev => prev.filter(u => u.id !== id));
    };

    return (
        <UploadContext.Provider value={{ uploads, startUpload, removeUpload }}>
            {children}
        </UploadContext.Provider>
    );
}

export const useUploads = () => useContext(UploadContext);
