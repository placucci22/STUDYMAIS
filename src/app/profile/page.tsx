"use client";

import { useApp } from "@/context/AppContext";
import { Card, Button } from "@/components/ui";
import { User, Settings, LogOut, CreditCard } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const { userPlan } = useApp();

    return (
        <div className="p-6 pt-12 space-y-8">
            <header className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-neural-700 flex items-center justify-center border-2 border-neural-500">
                    <User className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Visionário</h1>
                    <p className="text-neural-400 text-sm capitalize">Plano {userPlan}</p>
                </div>
            </header>

            <section className="space-y-4">
                <h2 className="text-sm font-medium text-neural-500 uppercase tracking-wider">Conta</h2>

                <Link href="/paywall">
                    <Card className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-neural-400" />
                            <span className="text-white">Gerenciar Assinatura</span>
                        </div>
                        <span className="text-xs bg-neural-800 text-neural-300 px-2 py-1 rounded">
                            {userPlan === 'free' ? 'Fazer Upgrade' : 'Ativo'}
                        </span>
                    </Card>
                </Link>

                <Card className="flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors">
                    <Settings className="w-5 h-5 text-neural-400" />
                    <span className="text-white">Configurações do App</span>
                </Card>
            </section>

            <Button variant="danger" className="w-full">
                <LogOut className="mr-2 w-4 h-4" />
                Sair da Conta
            </Button>
        </div>
    );
}
