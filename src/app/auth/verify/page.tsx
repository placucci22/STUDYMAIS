"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { Loader2, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OTPInput } from '@/components/auth/OTPInput';

function VerifyContent() {
    const { verifyOtp } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const redirect = searchParams.get('redirect');
    const action = searchParams.get('action');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (otp: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await verifyOtp(email, otp);
            if (error) throw error;

            // Success!
            // Check if we have a redirect target
            if (redirect) {
                // If we have an action, append it
                let target = redirect;
                if (action) target += `${target.includes('?') ? '&' : '?'}action=${action}`;
                router.push(target);
            } else {
                // Default flow: Go to home (middleware will intercept if profile is missing)
                router.push('/');
            }
        } catch (err: any) {
            console.error(err);
            setError("Código inválido ou expirado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-neural-900 via-background to-background z-0" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-void-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neural-800/50 border border-neural-700 mb-4 shadow-lg shadow-neural-500/10">
                        <ShieldCheck className="w-6 h-6 text-neural-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Verificação</h1>
                    <p className="text-neural-400">
                        Digite o código de 6 dígitos enviado para <br />
                        <span className="text-white font-medium">{email}</span>
                    </p>
                </div>

                <Card className="p-8 bg-neural-900/50 backdrop-blur-xl border-neural-800 shadow-2xl">
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <OTPInput
                                length={6}
                                onComplete={handleVerify}
                                error={!!error}
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20"
                            >
                                {error}
                            </motion.p>
                        )}

                        {isLoading && (
                            <div className="flex justify-center">
                                <Loader2 className="w-6 h-6 text-neural-500 animate-spin" />
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button
                                variant="ghost"
                                className="w-full text-neural-400 hover:text-white"
                                onClick={() => router.push('/auth/login')}
                            >
                                <ArrowLeft className="mr-2 w-4 h-4" /> Voltar e corrigir e-mail
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function AuthVerifyPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
