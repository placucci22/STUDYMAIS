"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { useApp } from "@/context/AppContext";
import { Card, Button, ProgressBar } from "@/components/ui";
import { Play, Pause, SkipBack, SkipForward, FastForward, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayerPage() {
    const {
        status, currentModule, audioData, currentTime, duration, speed, error,
        generateAndPlay, play, pause, seek, changeSpeed
    } = usePlayer();

    const { library } = useApp();
    const router = useRouter();

    const [showLyrics, setShowLyrics] = useState(false);

    // Mock lyrics synchronization (since we don't have real timestamps yet)
    // We split the raw text by sentences/newlines and estimate time based on length
    const [lyrics, setLyrics] = useState<{ text: string, startTime: number }[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    useEffect(() => {
        if (currentModule?.raw_text) {
            // Simple heuristic: 15 chars per second roughly
            const lines = currentModule.raw_text.split(/(?<=[.!?])\s+/).filter(l => l.length > 0);
            let accumulatedTime = 0;
            const parsedLyrics = lines.map(line => {
                const duration = Math.max(2, line.length * 0.06); // Estimate duration
                const item = { text: line, startTime: accumulatedTime };
                accumulatedTime += duration;
                return item;
            });
            setLyrics(parsedLyrics);
        }
    }, [currentModule]);

    useEffect(() => {
        if (lyrics.length > 0) {
            // Find current line based on currentTime
            // In a real implementation, we'd use exact timestamps from TTS
            // Here we map currentTime (0-100%) to the estimated total duration of text
            // But wait, we have real `duration` from the player.
            // Let's assume the estimated text duration matches the audio duration for this mock.

            const totalEstimated = lyrics[lyrics.length - 1].startTime + 5; // + buffer
            const relativeTime = (currentTime / (duration || 1)) * totalEstimated;

            const index = lyrics.findIndex((l, i) => {
                const next = lyrics[i + 1];
                return relativeTime >= l.startTime && (!next || relativeTime < next.startTime);
            });

            if (index !== -1) setCurrentLineIndex(index);
        }
    }, [currentTime, duration, lyrics]);

    // Auto-scroll to active line
    useEffect(() => {
        if (showLyrics) {
            const activeEl = document.getElementById(`lyric-${currentLineIndex}`);
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentLineIndex, showLyrics]);

    // Auto-play latest item (new or in-progress)
    useEffect(() => {
        if (status === 'idle' && !currentModule && library.length > 0) {
            // Sort by last_accessed to get the very latest interaction (upload or play)
            const latest = [...library].sort((a, b) => b.last_accessed - a.last_accessed)[0];

            if (latest) {
                console.log("Auto-playing material:", latest.title, "Has Text:", !!latest.raw_text);
                generateAndPlay(latest);
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
            <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center space-y-12">
                <div className="relative h-48 w-48 flex items-center justify-center">
                    {/* Neural Scanner Effect */}
                    <div className="absolute inset-0 bg-neural-500/10 blur-3xl rounded-full animate-pulse-slow" />

                    {/* Rotating Rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-neural-500/20 border-t-neural-500/60 border-r-transparent"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-full border border-void-500/20 border-b-neural-400/40 border-l-transparent"
                    />

                    {/* Central Brain/Core */}
                    <div className="relative z-10 bg-neural-900/80 backdrop-blur-sm p-6 rounded-2xl border border-neural-700/50 shadow-2xl">
                        <Loader2 className="w-12 h-12 text-neural-300 animate-spin" />
                    </div>

                    {/* Scanning Beam */}
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neural-400/50 to-transparent blur-sm z-20"
                    />
                </div>

                <div className="space-y-3 max-w-md mx-auto">
                    <motion.h2
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neural-300 via-white to-neural-300"
                    >
                        {status === 'generating_script' ? 'Decodificando Estrutura...' : 'Sintetizando Voz Neural...'}
                    </motion.h2>
                    <p className="text-neural-400 text-sm leading-relaxed">
                        A IA está convertendo seu material em uma experiência de áudio imersiva.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] p-6 pt-12 max-w-md mx-auto w-full relative">

            {/* LYRICS OVERLAY */}
            <AnimatePresence>
                {showLyrics && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute inset-0 z-20 bg-void-900/95 backdrop-blur-xl rounded-3xl flex flex-col p-6 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold text-neural-400 uppercase tracking-widest">Transcrição Neural</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowLyrics(false)}>
                                <span className="sr-only">Fechar</span>
                                &times;
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar mask-linear-fade">
                            {lyrics.map((line, i) => (
                                <motion.p
                                    key={i}
                                    id={`lyric-${i}`}
                                    animate={{
                                        opacity: i === currentLineIndex ? 1 : 0.3,
                                        scale: i === currentLineIndex ? 1.05 : 1,
                                        filter: i === currentLineIndex ? 'blur(0px)' : 'blur(1px)'
                                    }}
                                    className={`text-lg font-medium transition-all duration-500 ${i === currentLineIndex ? 'text-white' : 'text-neural-400'}`}
                                >
                                    {line.text}
                                </motion.p>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Visualizer / Cover */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-b from-neural-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />

                {/* Liquid Waveform Container */}
                <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
                    {/* Outer Glow */}
                    <motion.div
                        animate={{ scale: status === 'playing' ? [1, 1.05, 1] : 1, opacity: status === 'playing' ? 0.6 : 0.3 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-neural-500/20 blur-3xl rounded-full"
                    />

                    {/* Main Visualizer */}
                    <Card className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-neural-900/90 to-void-900/90 border-neural-700/30 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
                        <div className="flex items-center justify-center gap-1.5 h-32 w-full px-8">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        height: status === 'playing'
                                            ? [24, Math.random() * 80 + 30, 24]
                                            : 8,
                                        backgroundColor: status === 'playing' ? '#A78BFA' : '#4B5563'
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        repeatType: "mirror",
                                        delay: i * 0.05,
                                        ease: "easeInOut"
                                    }}
                                    className="w-3 rounded-full opacity-90"
                                />
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-2 text-center mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-white line-clamp-2 leading-tight"
                >
                    {currentModule?.title || "Carregando..."}
                </motion.h1>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-neural-400 text-sm font-medium tracking-wide uppercase">Módulo de Aprendizagem</p>
                    <button
                        onClick={() => setShowLyrics(!showLyrics)}
                        className="bg-neural-800/50 hover:bg-neural-700 text-xs px-2 py-0.5 rounded text-neural-300 transition-colors border border-neural-700"
                    >
                        Lyrics
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-8">
                {/* Progress */}
                <div className="space-y-3 group">
                    <ProgressBar progress={(currentTime / (duration || 1)) * 100} className="h-2 rounded-full bg-neural-800" />
                    <div className="flex justify-between text-xs text-neural-500 font-mono group-hover:text-neural-300 transition-colors">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between px-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={changeSpeed}
                        className="text-xs font-bold text-neural-400 hover:text-white w-12 h-12 rounded-full hover:bg-neural-800 transition-all"
                    >
                        {speed}x
                    </Button>

                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => seek(currentTime - 15)}
                            className="text-neural-400 hover:text-white hover:bg-transparent hover:scale-110 transition-all p-2 h-auto"
                        >
                            <SkipBack className="w-8 h-8" />
                        </Button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={status === 'playing' ? pause : play}
                            className="h-20 w-20 rounded-full bg-white text-neural-900 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-shadow"
                        >
                            <AnimatePresence mode="wait">
                                {status === 'playing' ? (
                                    <motion.div
                                        key="pause"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                    >
                                        <Pause className="w-8 h-8 fill-current" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="play"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                    >
                                        <Play className="w-8 h-8 fill-current ml-1" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => seek(currentTime + 15)}
                            className="text-neural-400 hover:text-white hover:bg-transparent hover:scale-110 transition-all p-2 h-auto"
                        >
                            <SkipForward className="w-8 h-8" />
                        </Button>
                    </div>

                    <div className="w-12" /> {/* Spacer for balance */}
                </div>
            </div>
        </div>
    );
}
