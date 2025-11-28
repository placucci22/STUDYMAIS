"use client";

import { useState } from 'react';
import { analyze_pdf, track_event } from '@/lib/backend/actions';
import { useApp } from '@/context/AppContext';

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
        if (file.size > 100 * 1024 * 1024) {
            setStatus('error');
            setError("Arquivo muito grande. O limite é 100MB.");
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

            // Simulate Upload Progress
            for (let i = 0; i <= 100; i += 10) {
                setProgress(i);
                await new Promise(r => setTimeout(r, 200));
            }

            setStatus('processing');

            // Call Backend
            const result = await analyze_pdf(file);



            // Success
            const newMaterial = {
                id: Date.now(),
                title: result.title || file.name.replace('.pdf', ''),
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
            setError(err.message || "Não consegui ler este PDF. Tente uma versão com texto selecionável.");
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
