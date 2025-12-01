"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { Loader2, User, Sparkles, ArrowRight, BookOpen, Target, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
    { id: 'estudante', label: 'Estudante (Escola)', icon: BookOpen },
    { id: 'universitario', label: 'Universitário', icon: GraduationCap },
    { id: 'concursando', label: 'Concursando', icon: Target },
    { id: 'profissional', label: 'Profissional', icon: User },
    { id: 'outro', label: 'Outro', icon: Sparkles },
];

export default function ProfileSetupPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        category: '',
        course_area: '',
        main_goal: ''
    });

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    age: parseInt(formData.age),
                    category: formData.category,
                    course_area: formData.course_area,
                    main_goal: formData.main_goal,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            // Redirect to home or original destination
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            const action = params.get('action');

            if (redirect) {
                let target = redirect;
                if (action) target += `${target.includes('?') ? '&' : '?'}action=${action}`;
                router.push(target);
            } else {
                router.push('/');
            }

            router.refresh(); // Ensure middleware re-runs or context updates
        } catch (error) {
            console.error('Error saving profile:', error);
            alert(`Erro ao salvar perfil: ${(error as any).message || JSON.stringify(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = formData.full_name && formData.age && formData.category && formData.course_area && formData.main_goal;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-neural-900 via-background to-background z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl relative z-10 space-y-8"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white">Configurar Perfil</h1>
                    <p className="text-neural-400">Conte um pouco sobre você para personalizarmos sua experiência.</p>
                </div>

                <Card className="p-8 bg-neural-900/50 backdrop-blur-xl border-neural-800 shadow-2xl space-y-6">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neural-300">Nome Completo</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-void-900 border border-neural-700 rounded-xl p-3 text-white focus:border-neural-500 outline-none"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neural-300">Idade</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                                className="w-full bg-void-900 border border-neural-700 rounded-xl p-3 text-white focus:border-neural-500 outline-none"
                                placeholder="Anos"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neural-300">O que te define melhor?</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`
                                        p-3 rounded-xl border text-left transition-all flex flex-col gap-2
                                        ${formData.category === cat.id
                                            ? 'bg-neural-600/20 border-neural-500 text-white'
                                            : 'bg-void-800 border-neural-800 text-neural-400 hover:border-neural-600'}
                                    `}
                                >
                                    <cat.icon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Context */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neural-300">Curso ou Área de Estudo</label>
                        <input
                            type="text"
                            value={formData.course_area}
                            onChange={e => setFormData({ ...formData, course_area: e.target.value })}
                            className="w-full bg-void-900 border border-neural-700 rounded-xl p-3 text-white focus:border-neural-500 outline-none"
                            placeholder="Ex: Direito, Engenharia, Ensino Médio..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neural-300">Objetivo Principal</label>
                        <textarea
                            value={formData.main_goal}
                            onChange={e => setFormData({ ...formData, main_goal: e.target.value })}
                            className="w-full h-24 bg-void-900 border border-neural-700 rounded-xl p-3 text-white focus:border-neural-500 outline-none resize-none"
                            placeholder="Ex: Passar no concurso da PF, Aprender Inglês..."
                        />
                    </div>

                    <Button
                        className="w-full h-12 text-base shadow-lg shadow-neural-500/20"
                        onClick={handleSave}
                        disabled={isLoading || !isFormValid}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Concluir Setup <ArrowRight className="ml-2 w-5 h-5" />
                            </>
                        )}
                    </Button>
                </Card>
            </motion.div>
        </div>
    );
}
