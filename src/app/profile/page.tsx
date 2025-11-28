"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { LogOut, User, BookOpen, Target, GraduationCap, Sparkles, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Profile {
    full_name: string;
    age: number;
    category: string;
    course_area: string;
    main_goal: string;
}

const CATEGORY_ICONS: Record<string, any> = {
    'estudante': BookOpen,
    'universitario': GraduationCap,
    'concursando': Target,
    'profissional': User,
    'outro': Sparkles,
};

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) setProfile(data);
            setIsLoading(false);
        };
        fetchProfile();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/auth/login');
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-neural-400">Carregando perfil...</div>;
    }

    const Icon = profile?.category ? CATEGORY_ICONS[profile.category] || Sparkles : Sparkles;

    return (
        <div className="min-h-screen bg-background p-6 pb-32 space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                </Button>
            </header>

            {profile ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neural-900 to-void-900 border border-neural-700/50 p-6 shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-neural-500/20 blur-3xl rounded-full" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-neural-800 border-2 border-neural-600 flex items-center justify-center">
                                <Icon className="w-8 h-8 text-neural-300" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
                                <p className="text-neural-400 text-sm capitalize">{profile.category} • {profile.age} anos</p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <Card className="p-6 space-y-4 bg-neural-900/30 border-neural-800">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-neural-500 uppercase tracking-wider">Área de Estudo</label>
                            <p className="text-white font-medium">{profile.course_area}</p>
                        </div>
                        <div className="h-px bg-neural-800" />
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-neural-500 uppercase tracking-wider">Objetivo Principal</label>
                            <p className="text-white font-medium">{profile.main_goal}</p>
                        </div>
                    </Card>

                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => router.push('/profile/setup')}
                    >
                        <Edit2 className="w-4 h-4 mr-2" /> Editar Perfil
                    </Button>

                </motion.div>
            ) : (
                <div className="text-center py-12 space-y-4">
                    <p className="text-neural-400">Perfil não encontrado.</p>
                    <Button onClick={() => router.push('/profile/setup')}>Criar Perfil</Button>
                </div>
            )}
        </div>
    );
}
