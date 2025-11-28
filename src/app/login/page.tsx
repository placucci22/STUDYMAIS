"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, ArrowRight, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { signInWithOtp, verifyOtp } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendEmail = async () => {
        if (!email) return;
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await signInWithOtp(email);
            if (error) throw error;
            setStep('otp');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao enviar código.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return;
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await verifyOtp(email, otp);
            if (error) throw error;
            router.push('/');
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
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neural-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-void-500/10 rounded-full blur-[100px] pointer-events-none" />

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
                    <h1 className="text-3xl font-bold text-white tracking-tight">Acesso Seguro</h1>
                    <p className="text-neural-400">Entre para acessar seus planos de estudo.</p>
                </div>

                <Card className="p-8 bg-neural-900/50 backdrop-blur-xl border-neural-800 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {step === 'email' ? (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neural-300">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neural-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            className="w-full bg-void-900 border border-neural-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-neural-600 focus:border-neural-500 focus:ring-1 focus:ring-neural-500 outline-none transition-all"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    className="w-full h-12 text-base shadow-lg shadow-neural-500/20"
                                    onClick={handleSendEmail}
                                    disabled={isLoading || !email}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Receber Código <ArrowRight className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-neural-500">
                                    Enviaremos um código de acesso temporário. <br />Sem senhas para decorar.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 text-green-400 mb-2">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">Verifique seu e-mail</h3>
                                    <p className="text-sm text-neural-400">
                                        Enviamos um código para <span className="text-white font-medium">{email}</span>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neural-300">Código de 6 dígitos</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="w-full bg-void-900 border border-neural-700 rounded-xl py-3 px-4 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder:text-neural-700 focus:border-neural-500 focus:ring-1 focus:ring-neural-500 outline-none transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    className="w-full h-12 text-base shadow-lg shadow-neural-500/20"
                                    onClick={handleVerifyOtp}
                                    disabled={isLoading || otp.length < 6}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Entrar <ShieldCheck className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </Button>

                                <button
                                    onClick={() => setStep('email')}
                                    className="w-full text-sm text-neural-500 hover:text-neural-300 transition-colors"
                                >
                                    Voltar e corrigir e-mail
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}
