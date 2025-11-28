"use client";

import { useUpload } from "@/hooks/useUpload";
import { Card, Button, ProgressBar } from "@/components/ui";
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
    const { status, progress, error, uploadFile, setStatus } = useUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (status === 'uploading' || status === 'processing') return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (status !== 'uploading' && status !== 'processing') {
            setStatus('dragging');
        }
    };

    const handleDragLeave = () => {
        if (status === 'dragging') {
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="p-6 pt-24 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Ingestão Completa</h2>
                    <p className="text-neural-400">Seu conteúdo foi assimilado pelo sistema.</p>
                </div>
                <div className="flex gap-4 w-full max-w-xs">
                    <Button variant="secondary" className="flex-1" onClick={() => window.location.reload()}>
                        Novo Upload
                    </Button>
                    <Button className="flex-1" onClick={() => router.push('/library')}>
                        Ver na Biblioteca
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 pt-12 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-white">Upload Neural</h1>
                <p className="text-neural-400 text-sm">Arraste seus documentos para expandir sua base de conhecimento.</p>
            </header>

            <Card
                className={`
          border-2 border-dashed transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center gap-6 relative overflow-hidden
          ${status === 'dragging' ? 'border-neural-500 bg-neural-500/10 scale-[1.02]' : 'border-neural-700/50 hover:border-neural-600'}
          ${error ? 'border-red-500/50 bg-red-500/5' : ''}
        `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                />

                <AnimatePresence mode="wait">
                    {status === 'idle' || status === 'dragging' ? (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-4 pointer-events-none"
                        >
                            <div className={`
                h-16 w-16 mx-auto rounded-full flex items-center justify-center transition-colors duration-300
                ${status === 'dragging' ? 'bg-neural-500 text-white' : 'bg-neural-800 text-neural-400'}
              `}>
                                <UploadIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Toque ou arraste um PDF</p>
                                <p className="text-xs text-neural-500 mt-1">Máximo 100MB</p>
                            </div>
                        </motion.div>
                    ) : (status === 'uploading' || status === 'processing') ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-xs space-y-6 text-center"
                        >
                            <div className="relative h-20 w-20 mx-auto">
                                <div className="absolute inset-0 border-4 border-neural-800 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-neural-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-neural-300">{progress}%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-medium text-white">
                                    {status === 'uploading' ? 'Enviando para a Nuvem...' : 'Processando Neuralmente...'}
                                </h3>
                                <p className="text-xs text-neural-500">
                                    {status === 'uploading' ? 'Não feche esta tela.' : 'Isso pode levar alguns segundos.'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-4"
                        >
                            <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <p className="font-medium text-red-400">Falha na Ingestão</p>
                                <p className="text-xs text-red-300/70 mt-1 max-w-xs mx-auto">{error}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}>
                                Tentar Novamente
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}
