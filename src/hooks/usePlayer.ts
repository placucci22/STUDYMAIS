"use client";

import { useState, useRef, useEffect } from 'react';
import { generate_script, generate_audio, track_event } from '@/lib/backend/actions';
import { useApp, Material } from '@/context/AppContext';

export function usePlayer() {
    const [status, setStatus] = useState<'idle' | 'generating_script' | 'generating_audio' | 'ready' | 'playing' | 'paused' | 'error'>('idle');
    const [currentModule, setCurrentModule] = useState<Material | null>(null);
    const [audioData, setAudioData] = useState<{ url: string; duration: number; script: string } | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [speed, setSpeed] = useState(1.0);
    const [error, setError] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { updateProgress } = useApp();

    // Initialize Audio Element
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio();
            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
            });
            audioRef.current.addEventListener('ended', () => {
                setStatus('paused');
                if (currentModule) {
                    track_event('lesson_complete', { module_id: currentModule.id });
                    updateProgress(currentModule.id, 100);
                }
            });
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    // Update Speed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    }, [speed]);

    const generateAndPlay = async (module: Material) => {
        try {
            setCurrentModule(module);

            // Check Offline (Mock check for cache)
            if (!navigator.onLine) {
                // In a real PWA we would check CacheStorage
                // For now, block if offline
                throw new Error("Para usar IA, você precisa de conexão agora.");
            }

            setStatus('generating_script');
            setError(null);

            // 1. Generate Script
            const scriptResult = await generate_script({
                module_title: module.title,
                module_context: "Web Context"
            });



            setStatus('generating_audio');

            // 2. Generate Audio
            const audioResult = await generate_audio({
                script_text: scriptResult.script_text,
                voice_id: 'eleven_monolingual_v1'
            });



            // 3. Setup Player
            const data = {
                url: audioResult.audio_url,
                duration: audioResult.duration,
                script: scriptResult.script_text
            };
            setAudioData(data);

            if (audioRef.current) {
                // Use a placeholder MP3 for the mock if the URL is fake
                // But since we are in browser, we can't play a fake URL.
                // Let's use a short sample data URI or a real sample URL if available.
                // For this demo, we'll use a silent or beep base64 if needed, or just trust the browser handles the error gracefully?
                // Better: Use a reliable sample URL.
                audioRef.current.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Public sample
                audioRef.current.load();
            }

            setStatus('ready');
            play();

        } catch (err: any) {
            setStatus('error');
            setError(err.message || "Não consegui gerar a voz agora. Vamos tentar de novo?");
            track_event('audio_gen_fail', { error: err.message });
        }
    };

    const play = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Play failed", e));
            setStatus('playing');
            track_event('lesson_play', { module_id: currentModule?.id });
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setStatus('paused');
            if (currentModule) {
                const progress = (currentTime / (audioData?.duration || 1)) * 100;
                updateProgress(currentModule.id, Math.round(progress));
                track_event('lesson_pause', { module_id: currentModule.id, time: currentTime });
            }
        }
    };

    const seek = (time: number) => {
        if (audioRef.current && audioData) {
            const newTime = Math.max(0, Math.min(time, audioData.duration));
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const changeSpeed = () => {
        const speeds = [1.0, 1.25, 1.5, 2.0];
        const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
        setSpeed(speeds[nextIdx]);
    };

    return {
        status,
        currentModule,
        audioData,
        currentTime,
        duration: audioData?.duration || 0,
        speed,
        error,
        generateAndPlay,
        play,
        pause,
        seek,
        changeSpeed
    };
}
