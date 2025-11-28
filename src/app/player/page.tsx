"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { useApp } from "@/context/AppContext";
import { Card, Button, ProgressBar } from "@/components/ui";
import { Play, Pause, SkipBack, SkipForward, FastForward, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlayerPage() {
    const {
        status, currentModule, audioData, currentTime, duration, speed, error,
        generateAndPlay, play, pause, seek, changeSpeed
    } = usePlayer();

    const { library } = useApp();
    const router = useRouter();

    // Auto-play latest in-progress if idle
    useEffect(() => {
        if (status === 'idle' && !currentModule && library.length > 0) {
            const lastPlayed = library.filter(m => m.status === 'in_progress').sort((a, b) => b.last_accessed - a.last_accessed)[0] || library[0];
            if (lastPlayed) {
                generateAndPlay(lastPlayed);
            }
        }
    }, [status, currentModule, library]);

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Erro de Sintonia</h2>
                    <p className="text-neural-400 max-w-xs mx-auto">{error}</p>
                </div>
                <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </div>
        );
    }

    if (status === 'generating_script' || status === 'generating_audio') {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center space-y-8">
                <div className="relative h-32 w-32">
                    <div className="absolute inset-0 bg-neural-500/20 blur-3xl rounded-full animate-pulse-slow" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full border-4 border-neural-500/30 rounded-full border-t-neural-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-neural-400 animate-spin" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">
                        {status === 'generating_script' ? 'Decodificando Conceitos...' : 'Sintetizando Voz Neural...'}
                    </h2>
                    <p className="text-neural-400 text-sm max-w-xs mx-auto">
                        A IA está transformando seu PDF em uma aula de áudio imersiva.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] p-6 pt-12">
            {/* Visualizer / Cover */}
            <div className="flex-1 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-neural-500/10 blur-3xl rounded-full animate-pulse-slow" />
                <Card className="w-64 h-64 flex items-center justify-center bg-neural-900/50 border-neural-700/50 relative z-10 overflow-hidden">
                    {/* Fake Waveform */}
                    <div className="flex items-center gap-1 h-32">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: status === 'playing' ? [20, 60, 30, 80, 40] : 10 }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                                className="w-2 bg-neural-500 rounded-full opacity-80"
                            />
                        ))}
                    </div>
                </Card>
            </div>

            {/* Info */}
            <div className="space-y-2 text-center mb-8">
                <h1 className="text-2xl font-bold text-white line-clamp-2">
                    {currentModule?.title || "Carregando..."}
                </h1>
                <p className="text-neural-400 text-sm">Módulo de Aprendizagem</p>
            </div>

            {/* Controls */}
            <div className="space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                    <ProgressBar progress={(currentTime / (duration || 1)) * 100} className="h-1.5" />
                    <div className="flex justify-between text-xs text-neural-500 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={changeSpeed} className="text-xs font-mono w-12">
                        {speed}x
                    </Button>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => seek(currentTime - 15)}>
                            <SkipBack className="w-6 h-6" />
                        </Button>

                        <button
                            onClick={status === 'playing' ? pause : play}
                            className="h-16 w-16 rounded-full bg-white text-neural-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                        >
                            {status === 'playing' ? (
                                <Pause className="w-8 h-8 fill-current" />
                            ) : (
                                <Play className="w-8 h-8 fill-current ml-1" />
                            )}
                        </button>

                        <Button variant="ghost" size="sm" onClick={() => seek(currentTime + 15)}>
                            <SkipForward className="w-6 h-6" />
                        </Button>
                    </div>

                    <Button variant="ghost" size="sm" className="w-12 opacity-0 pointer-events-none">
                        {/* Spacer */}
                    </Button>
                </div>
            </div>
        </div>
    );
}
