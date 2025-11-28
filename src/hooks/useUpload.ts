"use client";

import { useState } from 'react';
import { analyze_pdf, track_event } from '@/lib/backend/actions';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export function useUpload() {
    const [status, setStatus] = useState<'idle' | 'dragging' | 'validating' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadedMaterial, setUploadedMaterial] = useState<any>(null);

    const { addToLibrary } = useApp();

    const reset = () => {
        setStatus('idle');
        setProgress(0);
        setError(null);
        setUploadedMaterial(null);
    };

    const uploadFile = async (file: File) => {
        if (!navigator.onLine) {
            setStatus('error');
            setError("Para usar IA, você precisa de conexão agora.");
            return;
        }

        if (!file) return;

        // Validation
        // Supabase Free Tier is generous (50MB+), but let's keep it reasonable.
        if (file.size > 50 * 1024 * 1024) {
            setStatus('error');
            setError("Arquivo muito grande. O limite é 50MB.");
            track_event('ingest_fail', { error: "Size Limit", file: file.name });
            return;
        }

        if (file.type !== 'application/pdf') {
            setStatus('error');
            setError("Formato inválido. Por favor, envie apenas arquivos PDF.");
            track_event('ingest_fail', { error: "Invalid Type", file: file.name });
            return;
        }

        try {
            setStatus('uploading');
            setError(null);

            // 1. Upload to Supabase Storage
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const { data, error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, file);

            if (uploadError) {
                throw new Error(`Upload falhou: ${uploadError.message}`);
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName);

            setStatus('processing');

            // 3. Call Backend with URL
            const result = await analyze_pdf(publicUrl, file.name.replace('.pdf', ''));

            // Success
            const newMaterial = {
                id: Date.now(),
                title: result.title,
                cover_color: "#8B5CF6", // Default Neural Violet
                progress: 0,
                status: 'new' as const,
                last_accessed: Date.now(),
                is_favorite: false,
                modules_count: result.chapters.length,
                raw_text: result.raw_text
            };

            setUploadedMaterial(newMaterial);
            addToLibrary(newMaterial);
            setStatus('success');

        } catch (err: any) {
            setStatus('error');
            setError(err.message || "Não consegui processar este arquivo.");
            track_event('ingest_fail', { error: err.message });
        }
    };

    return {
        status,
        progress,
        error,
        uploadedMaterial,
        uploadFile,
        reset,
        setStatus // Exposed for drag events
    };
}
