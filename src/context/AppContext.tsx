"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- TYPES ---
export type PlanType = 'free' | 'premium' | 'pro';

export interface Material {
    id: number;
    title: string;
    cover_color: string;
    progress: number;
    status: 'new' | 'in_progress' | 'completed';
    last_accessed: number;
    is_favorite: boolean;
    modules_count: number;
    raw_text?: string;
}

interface AppContextType {
    userPlan: PlanType;
    setUserPlan: (plan: PlanType) => void;
    studyPlan: { active: boolean; title?: string } | null;
    setStudyPlan: (plan: { active: boolean; title?: string } | null) => void;
    library: Material[];
    addToLibrary: (material: Material) => void;
    updateProgress: (id: number, progress: number) => void;
    toggleFavorite: (id: number) => void;
    isLoading: boolean;
}

// --- MOCK DATA ---
const MOCK_LIBRARY: Material[] = [
    {
        id: 101,
        title: "Introdução à Neurociência",
        cover_color: "#8B5CF6",
        progress: 45,
        status: 'in_progress',
        last_accessed: Date.now() - 100000,
        is_favorite: true,
        modules_count: 3
    },
    {
        id: 102,
        title: "Direito Constitucional",
        cover_color: "#3B82F6",
        progress: 100,
        status: 'completed',
        last_accessed: Date.now() - 86400000,
        is_favorite: false,
        modules_count: 5
    }
];

// --- CONTEXT ---
const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [userPlan, setUserPlan] = useState<PlanType>('free');
    const [library, setLibrary] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [studyPlan, setStudyPlan] = useState<{ active: boolean; title?: string } | null>(null);

    // Load Initial Data
    useEffect(() => {
        const loadData = async () => {
            // Simulate fetch
            await new Promise(r => setTimeout(r, 800));

            // Try local storage first
            const savedLib = localStorage.getItem('cognitive_library');
            if (savedLib) {
                setLibrary(JSON.parse(savedLib));
            } else {
                setLibrary(MOCK_LIBRARY);
            }

            const savedPlan = localStorage.getItem('cognitive_plan');
            if (savedPlan) setUserPlan(savedPlan as PlanType);

            const savedStudyPlan = localStorage.getItem('cognitive_study_plan');
            if (savedStudyPlan) setStudyPlan(JSON.parse(savedStudyPlan));

            setIsLoading(false);
        };
        loadData();
    }, []);

    // Persist Library Changes
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('cognitive_library', JSON.stringify(library));
        }
    }, [library, isLoading]);

    // Persist Plan Changes
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('cognitive_plan', userPlan);
        }
    }, [userPlan, isLoading]);

    // Persist Study Plan Changes
    useEffect(() => {
        if (!isLoading) {
            if (studyPlan) {
                localStorage.setItem('cognitive_study_plan', JSON.stringify(studyPlan));
            } else {
                localStorage.removeItem('cognitive_study_plan');
            }
        }
    }, [studyPlan, isLoading]);

    const addToLibrary = (material: Material) => {
        setLibrary(prev => [material, ...prev]);
    };

    const updateProgress = (id: number, progress: number) => {
        setLibrary(prev => prev.map(m => {
            if (m.id === id) {
                return {
                    ...m,
                    progress,
                    status: progress >= 100 ? 'completed' : 'in_progress',
                    last_accessed: Date.now()
                };
            }
            return m;
        }));
    };

    const toggleFavorite = (id: number) => {
        setLibrary(prev => prev.map(m =>
            m.id === id ? { ...m, is_favorite: !m.is_favorite } : m
        ));
    };

    return (
        <AppContext.Provider value={{
            userPlan,
            setUserPlan,
            studyPlan,
            setStudyPlan,
            library,
            addToLibrary,
            updateProgress,
            toggleFavorite,
            isLoading
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
