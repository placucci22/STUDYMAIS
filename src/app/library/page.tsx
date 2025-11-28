"use client";

import { useApp } from "@/context/AppContext";
import { Card, ProgressBar } from "@/components/ui";
import { BookOpen, Clock, Star, MoreVertical, Play } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LibraryPage() {
    const { library, toggleFavorite, studyPlan } = useApp();
    const [filter, setFilter] = useState<'plan' | 'all' | 'in_progress' | 'favorites'>('plan');
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    // If no plan, default to 'all'
    if (!studyPlan?.active && filter === 'plan') {
        setFilter('all');
    }

    const filteredLibrary = library.filter(item => {
        if (filter === 'in_progress') return item.status === 'in_progress';
        if (filter === 'favorites') return item.is_favorite;
        return true;
    });

    return (
        <div className="p-6 pt-12 space-y-6 pb-24">
            <header>
                <h1 className="text-2xl font-bold text-white">Biblioteca</h1>
                <p className="text-neural-400 text-sm">Seu acervo de conhecimento neural.</p>
            </header>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    ...(studyPlan?.active ? [{ id: 'plan', label: 'Meu Plano' }] : []),
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
            {filter === 'plan' && studyPlan && (
                <div className="space-y-4">
                    {studyPlan.subjects.map((subject, idx) => {
                        const subjectLessons = studyPlan.lessons.filter(l => l.subject === subject);
                        const isExpanded = expandedSubject === subject;

                        return (
                            <Card key={subject} className="overflow-hidden border-neural-800">
                                <div
                                    className="p-4 flex items-center justify-between bg-neural-900/30 cursor-pointer hover:bg-neural-800/50 transition-colors"
                                    onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-neural-800 flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: `hsl(${260 + (idx * 30)}, 70%, 60%)` }}>
                                            {subject.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{subject}</h3>
                                            <p className="text-xs text-neural-500">{subjectLessons.length} aulas</p>
                                        </div>
                                    </div>
                                    <MoreVertical className="w-4 h-4 text-neural-500" />
                                </div>

                                {isExpanded && (
                                    <div className="bg-neural-900/10 border-t border-neural-800 divide-y divide-neural-800/50">
                                        {subjectLessons.map((lesson) => (
                                            <Link href="/player" key={lesson.id}>
                                                <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                                                    <div className={`
                                                        h-8 w-8 rounded-full flex items-center justify-center border-2 
                                                        ${lesson.status === 'completed' ? 'bg-green-500/20 border-green-500 text-green-500' :
                                                            lesson.status === 'unlocked' ? 'border-neural-500 text-neural-300' :
                                                                'border-neural-800 text-neural-700'}
                                                    `}>
                                                        {lesson.status === 'completed' ? <Star className="w-3 h-3 fill-current" /> :
                                                            lesson.status === 'locked' ? <div className="w-2 h-2 rounded-full bg-neural-800" /> :
                                                                <Play className="w-3 h-3 fill-current" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm font-medium ${lesson.status === 'locked' ? 'text-neural-600' : 'text-neural-300'}`}>
                                                            {lesson.title}
                                                        </h4>
                                                        <p className="text-xs text-neural-600 line-clamp-1">{lesson.description}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

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
                                        className="h-16 w-16 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                                        style={{ backgroundColor: item.cover_color }}
                                    >
                                        {item.title.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-white truncate pr-4">{item.title}</h3>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                                className={`transition-colors ${item.is_favorite ? 'text-yellow-400' : 'text-neural-600 hover:text-neural-400'}`}
                                            >
                                                <Star className="w-4 h-4 fill-current" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mt-1 text-xs text-neural-400">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> {item.modules_count} Módulos
                                            </span>
                                            {item.last_accessed > 0 && (
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
                                    <Link href="/player" className="absolute inset-0 z-10" />
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
