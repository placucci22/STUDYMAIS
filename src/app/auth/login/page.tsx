"use client";

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowRight, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
    const { signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao iniciar login com Google.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-neural-900 via-background to-background z-0" />
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neural-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neural-800/50 border border-neural-700 mb-4 shadow-lg shadow-neural-500/10">
                        <Lock className="w-6 h-6 text-neural-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Acesso ao Sistema</h1>
                    <p className="text-neural-400">Entre para continuar sua jornada cognitiva.</p>
                </div>

                <Card className="p-8 bg-neural-900/50 backdrop-blur-xl border-neural-800 shadow-2xl">
                    <div className="space-y-6">
                        {error && (
                            <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </p>
                        )}

                        <Button
                            className="w-full h-12 text-base shadow-lg shadow-neural-500/20 bg-white text-black hover:bg-gray-100 border border-gray-200"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            Continuar com Google
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function AuthLoginPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <LoginContent />
        </Suspense>
    );
}
