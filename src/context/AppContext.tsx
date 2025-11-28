"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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

export type StudyMaterial = {
    id: string;
    subject: string;
    type: 'pdf' | 'image' | 'link' | 'text';
    source: 'upload' | 'manual' | 'link' | 'text';
    title?: string;
    url?: string;
    notes?: string;
};

export type StudyPlanDraft = {
    goal: string;
    subjects: string[];
    materials: StudyMaterial[];
};

export type Lesson = {
    id: string;
    subject: string;
    title: string;
    description?: string;
    audioUrl?: string;
    quizId?: string;
    order: number;
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
};

export type StudyPlan = {
    id: string;
    goal: string;
    subjects: string[];
    lessons: Lesson[];
    active: boolean;
    title?: string;
};

interface AppContextType {
    userPlan: PlanType;
    setUserPlan: (plan: PlanType) => void;
    studyPlan: StudyPlan | null;
    setStudyPlan: (plan: StudyPlan | null) => void;
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
    const { user } = useAuth();
    const [userPlan, setUserPlan] = useState<PlanType>('free');
    const [library, setLibrary] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);

    // Load Data when User Changes
    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                setLibrary([]);
                setStudyPlan(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            // Simulate fetch
            await new Promise(r => setTimeout(r, 500));

            // Try local storage with user-specific keys
            const savedLib = localStorage.getItem(`cognitive_library_${user.id}`);
            if (savedLib) {
                setLibrary(JSON.parse(savedLib));
            } else {
                setLibrary(MOCK_LIBRARY); // Default for new users for now
            }

            const savedPlan = localStorage.getItem(`cognitive_plan_${user.id}`);
            if (savedPlan) setUserPlan(savedPlan as PlanType);

            const savedStudyPlan = localStorage.getItem(`cognitive_study_plan_${user.id}`);
            if (savedStudyPlan) setStudyPlan(JSON.parse(savedStudyPlan));

            setIsLoading(false);
        };
        loadData();
    }, [user]);

    // Persist Library Changes
    useEffect(() => {
        if (!isLoading && user) {
            localStorage.setItem(`cognitive_library_${user.id}`, JSON.stringify(library));
        }
    }, [library, isLoading, user]);

    // Persist Plan Changes
    useEffect(() => {
        if (!isLoading && user) {
            localStorage.setItem(`cognitive_plan_${user.id}`, userPlan);
        }
    }, [userPlan, isLoading, user]);

    // Persist Study Plan Changes
    useEffect(() => {
        if (!isLoading && user) {
            if (studyPlan) {
                localStorage.setItem(`cognitive_study_plan_${user.id}`, JSON.stringify(studyPlan));
            } else {
                localStorage.removeItem(`cognitive_study_plan_${user.id}`);
            }
        }
    }, [studyPlan, isLoading, user]);

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
