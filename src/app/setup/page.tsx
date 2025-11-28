"use client";

import { Button, Card } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SetupPage() {
    const { setStudyPlan } = useApp();
    const router = useRouter();

    const handleCreatePlan = () => {
        // Mock creating a plan
        setStudyPlan({ active: true, title: "Plano de Estudos Personalizado" });
        router.push('/');
    };

    return (
        <div className="p-6 pt-12 space-y-6">
            <header className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold text-white">Configurar Estudo Guiado</h1>
            </header>

            <Card className="p-8 text-center space-y-6">
                <div className="h-20 w-20 mx-auto rounded-full bg-neural-500/20 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-neural-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">Vamos personalizar sua jornada</h2>
                    <p className="text-neural-400 text-sm">
                        Esta é a tela onde o usuário configuraria seus objetivos, tempo disponível e interesses.
                    </p>
                </div>

                <Button onClick={handleCreatePlan} className="w-full">
                    Criar Plano (Simulação)
                </Button>
            </Card>
        </div>
    );
}
