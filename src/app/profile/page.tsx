"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { LogOut, User, BookOpen, Target, GraduationCap, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
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
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-neural-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="p-6 border-b border-neural-800 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">Meu Perfil</h1>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                </div>
            </header>

            <main className="p-6 space-y-8 max-w-md mx-auto">
                {/* Profile Header */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-neural-800 border-2 border-neural-700 flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-neural-400" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Usuário'}</h2>
                        <p className="text-neural-400">{profile?.email || user?.email}</p>
                    </div>
                </div>

                {/* Stats / Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-neural-900/50 border-neural-800">
                        <div className="space-y-1">
                            <p className="text-xs text-neural-500 uppercase tracking-wider">Nível</p>
                            <p className="text-lg font-bold text-white">Iniciado</p>
                        </div>
                    </Card>
                    <Card className="p-4 bg-neural-900/50 border-neural-800">
                        <div className="space-y-1">
                            <p className="text-xs text-neural-500 uppercase tracking-wider">Membro desde</p>
                            <p className="text-lg font-bold text-white">
                                {new Date(user?.created_at || Date.now()).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-6">
                    <Button
                        variant="danger"
                        className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                        onClick={signOut}
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
                    </Button>
                </div>
            </main>
        </div>
    );
}
