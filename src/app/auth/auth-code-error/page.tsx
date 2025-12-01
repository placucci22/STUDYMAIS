'use client';

import { Button } from '@/components/ui';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthCodeError() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-void-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Erro na Autenticação</h1>

            <p className="text-neural-400 max-w-md mb-8">
                Não foi possível validar seu login. Isso pode acontecer se o link expirou ou se houve uma falha na comunicação com o Google.
            </p>

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
