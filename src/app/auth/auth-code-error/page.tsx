'use client';

import { Button } from '@/components/ui';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen bg-void-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Erro na Autenticação</h1>

            <p className="text-neural-400 max-w-md mb-4">
                Não foi possível validar seu login.
            </p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 max-w-md w-full">
                    <p className="text-red-400 text-sm font-mono break-all">
                        {error}
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button
                    onClick={() => router.push('/auth/login')}
                    className="w-full"
                >
                    Tentar Novamente
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="w-full"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
                </Button>
            </div>
        </div>
    );
}

export default function AuthCodeError() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
