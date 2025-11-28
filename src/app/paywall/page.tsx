"use client";

import { usePaywall } from "@/hooks/usePaywall";
import { Card, Button } from "@/components/ui";
import { Check, Zap, Crown, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function PaywallPage() {
    const { currentPlan, upgradePlan } = usePaywall();

    const plans = [
        {
            id: 'premium',
            name: 'Visionário Premium',
            price: 'R$ 29,90',
            features: ['Uploads ilimitados', 'Voz Neural Básica', 'Modo Offline'],
            icon: Zap,
            color: 'bg-synapse-500'
        },
        {
            id: 'pro',
            name: 'Mente Mestra Pro',
            price: 'R$ 49,90',
            features: ['Tudo do Premium', 'Voz Neural Ultra-Realista', 'Resumos de IA Avançados', 'Prioridade no Suporte'],
            icon: Crown,
            color: 'bg-neural-600',
            popular: true
        }
    ];

    return (
        <div className="p-6 pt-12 pb-24 space-y-8">
            <header className="text-center space-y-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neural-300 to-synapse-500">
                    Evolua sua Cognição
                </h1>
                <p className="text-neural-400">
                    Desbloqueie o potencial máximo do seu segundo cérebro.
                </p>
            </header>

            <div className="space-y-6">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        className="relative"
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neural-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg z-10">
                                Mais Popular
                            </div>
                        )}
                        <Card className={`
              border-2 relative overflow-hidden
              ${currentPlan === plan.id ? 'border-green-500/50' : 'border-neural-700/30'}
            `}>
                            <div className={`absolute top-0 right-0 p-4 opacity-10 ${plan.color.replace('bg-', 'text-')}`}>
                                <plan.icon className="w-24 h-24" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl ${plan.color} flex items-center justify-center text-white shadow-lg`}>
                                        <plan.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                                        <p className="text-neural-400 text-sm">{plan.price} / mês</p>
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-neural-300">
                                            <Check className="w-4 h-4 text-green-400 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full ${plan.id === 'pro' ? 'bg-gradient-to-r from-neural-600 to-synapse-500' : ''}`}
                                    onClick={() => upgradePlan(plan.id as any)}
                                    disabled={currentPlan === plan.id}
                                >
                                    {currentPlan === plan.id ? 'Plano Atual' : 'Fazer Upgrade'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="text-center">
                <p className="text-xs text-neural-500 flex items-center justify-center gap-2">
                    <Shield className="w-3 h-3" /> Pagamento seguro e criptografado.
                </p>
            </div>
        </div>
    );
}
