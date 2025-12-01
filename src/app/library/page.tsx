"use client";

import { Card, ProgressBar } from "@/components/ui";
import { BookOpen, Clock, Star, Play } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
    const { library, toggleFavorite, generatedPlan } = useAppContext();
    const [filter, setFilter] = useState<'plan' | 'all' | 'in_progress' | 'favorites'>('plan');
    const router = useRouter();

    // If no plan, default to 'all'
    if (!generatedPlan && filter === 'plan') {
        setFilter('all');
    }

    const filteredLibrary = library.filter(item => {
        if (filter === 'in_progress') return item.status === 'in_progress';
        if (filter === 'favorites') return item.isFavorite;
        return true;
    });

    const renderPlan = () => {
        if (!generatedPlan) return (
            <div className="text-center py-12">
                <p className="text-neural-400">Você ainda não tem um plano de estudo.</p>
            </div>
        );

        return (
            <div className="space-y-6">
                <div className="bg-void-800 border border-neural-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-2">{generatedPlan.goal}</h2>
                    <div className="flex gap-2">
                        {generatedPlan.subjects.map((s: string) => (
                            <span key={s} className="px-2 py-1 rounded-md bg-neural-800 text-xs text-neural-300 border border-neural-700">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    {generatedPlan.schedule.map((day: any, idx: number) => (
                        <Card key={idx} className="p-4 border-neural-800 bg-void-800/50">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-medium text-white">Dia {day.day}</h3>
                                <span className="text-xs text-neural-400 bg-neural-900 px-2 py-1 rounded-full">{day.focus}</span>
                            </div>
                            <ul className="space-y-2">
                                {day.tasks.map((task: string, tIdx: number) => (
                                    <li key={tIdx} className="text-sm text-neural-300 flex gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-neural-600 mt-1.5 shrink-0" />
                                        {task}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 pt-12 space-y-6 pb-24">
            <header>
                <h1 className="text-2xl font-bold text-white">Biblioteca</h1>
                <p className="text-neural-400 text-sm">Seu acervo de conhecimento neural.</p>
            </header>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    ...(generatedPlan ? [{ id: 'plan', label: 'Meu Plano' }] : []),
                    { id: 'all', label: 'Todos' },
                    { id: 'in_progress', label: 'Em Progresso' },
                    { id: 'favorites', label: 'Favoritos' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`
              px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors
              ${filter === f.id
                                ? 'bg-neural-600 text-white'
                                : 'bg-void-800 text-neural-400 hover:bg-void-700'}
            `}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* PLAN VIEW */}
            {filter === 'plan' && renderPlan()}

            {/* REGULAR LIST VIEW */}
            {filter !== 'plan' && (
                <div className="space-y-4">
                    {filteredLibrary.length === 0 ? (
                        <div className="text-center py-12 text-neural-500 text-sm">
                            Nenhum material encontrado.
                        </div>
                    ) : (
                        filteredLibrary.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="p-4 flex gap-4 items-center group cursor-pointer hover:bg-white/5 transition-colors relative">
                                    {/* Cover */}
                                    <div
                                        className={`h-16 w-16 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br ${item.coverColor || 'from-gray-800 to-gray-900'}`}
                                    >
                                        {item.title.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-white truncate pr-4">{item.title}</h3>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                                className={`transition-colors ${item.isFavorite ? 'text-yellow-400' : 'text-neural-600 hover:text-neural-400'}`}
                                            >
                                                <Star className="w-4 h-4 fill-current" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mt-1 text-xs text-neural-400">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> {item.modulesCount || 0} Módulos
                                            </span>
                                            {(item.lastAccessed || 0) > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Recente
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <ProgressBar progress={item.progress} className="h-1" />
                                        </div>
                                    </div>

                                    {/* Hover Play Action */}
                                    <Link href={`/player?id=${item.id}`} className="absolute inset-0 z-10" />
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
