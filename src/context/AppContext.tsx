"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export type PlanType = 'free' | 'pro' | 'premium';

export interface StudyMaterial {
    id: string;
    name: string;
    type: 'pdf' | 'video' | 'link' | 'text';
    file?: File;
    url?: string;
    content?: string;
}

export interface LibraryItem {
    id: string;
    title: string;
    type: string;
    duration?: string;
    progress: number;
    isFavorite: boolean;
    url?: string;
    thumbnail?: string;
    // Extended properties
    coverColor?: string;
    status?: 'new' | 'in_progress' | 'completed' | 'locked' | 'unlocked';
    modulesCount?: number;
    lastAccessed?: number;
    rawText?: string;
}

export interface Lesson {
    id: string;
    subject: string;
    title: string;
    description: string;
    order: number;
    status: 'locked' | 'unlocked' | 'completed' | 'in_progress';
    audioUrl?: string;
}

export interface StudyPlanDraft {
    goal: string;
    subjects: string[];
}

export interface StudyPlan {
    id: string;
    goal: string;
    subjects: string[];
    lessons: Lesson[];
    active: boolean;
    title: string;
    schedule?: any[];
}

interface AppContextType {
    userPlan: PlanType;
    setUserPlan: (plan: PlanType) => void;
    library: LibraryItem[];
    addToLibrary: (item: LibraryItem) => void;
    updateProgress: (itemId: string, progress: number) => void;
    toggleFavorite: (itemId: string) => void;
    isLoading: boolean;
    // Draft State
    objective: string;
    setObjective: (obj: string) => void;
    objectiveType: 'general' | 'exam' | 'skill';
    setObjectiveType: (type: 'general' | 'exam' | 'skill') => void;
    subjects: string[];
    setSubjects: (subjects: string[]) => void;
    materials: StudyMaterial[];
    setMaterials: (materials: StudyMaterial[]) => void;
    generatedPlan: any;
    setGeneratedPlan: (plan: any) => void;
    // Persistence
    saveDraftPlan: () => void;
    restoreDraftPlan: () => boolean;
    clearDraftPlan: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [userPlan, setUserPlan] = useState<PlanType>('free');
    const [library, setLibrary] = useState<LibraryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Draft State
    const [objective, setObjective] = useState('');
    const [objectiveType, setObjectiveType] = useState<'general' | 'exam' | 'skill'>('general');
    const [subjects, setSubjects] = useState<string[]>([]);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [generatedPlan, setGeneratedPlan] = useState<any>(null);

    // Load Data when User Changes
    useEffect(() => {
        const loadUserData = async () => {
            if (!user) {
                setLibrary([]);
                setIsLoading(false);
                return;
            }

            try {
                // Load Library
                const { data: libraryData } = await supabase
                    .from('library')
                    .select('*')
                    .eq('user_id', user.id);

                if (libraryData) {
                    setLibrary(libraryData.map(item => ({
                        id: item.id,
                        title: item.title,
                        type: item.type,
                        duration: item.duration || '0 min',
                        progress: item.progress || 0,
                        isFavorite: item.is_favorite || false,
                        url: item.url,
                        thumbnail: item.thumbnail
                    })));
                }

                // Load User Plan (Subscription)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_type')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserPlan(profile.plan_type as PlanType);
                }

            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [user]);

    const addToLibrary = async (item: LibraryItem) => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('library')
                .insert({
                    user_id: user.id,
                    title: item.title,
                    type: item.type,
                    url: item.url,
                    thumbnail: item.thumbnail,
                    duration: item.duration,
                    progress: 0,
                    is_favorite: false
                })
                .select()
                .single();

            if (error) throw error;

            setLibrary(prev => [...prev, {
                id: data.id,
                title: data.title,
                type: data.type,
                duration: data.duration,
                progress: 0,
                isFavorite: false,
                url: data.url,
                thumbnail: data.thumbnail
            }]);
        } catch (error) {
            console.error('Error adding to library:', error);
        }
    };

    const updateProgress = async (itemId: string, progress: number) => {
        if (!user) return;

        setLibrary(prev => prev.map(item =>
            item.id === itemId ? { ...item, progress } : item
        ));

        try {
            await supabase
                .from('library')
                .update({ progress })
                .eq('id', itemId);
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const toggleFavorite = async (itemId: string) => {
        if (!user) return;

        const item = library.find(i => i.id === itemId);
        if (!item) return;

        const newStatus = !item.isFavorite;

        setLibrary(prev => prev.map(i =>
            i.id === itemId ? { ...i, isFavorite: newStatus } : i
        ));

        try {
            await supabase
                .from('library')
                .update({ is_favorite: newStatus })
                .eq('id', itemId);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const saveDraftPlan = () => {
        if (typeof window === 'undefined') return;
        const draft = {
            objective,
            objectiveType,
            subjects,
            materials
        };
        localStorage.setItem('study_plan_draft', JSON.stringify(draft));
    };

    const restoreDraftPlan = () => {
        if (typeof window === 'undefined') return false;
        const draftStr = localStorage.getItem('study_plan_draft');
        if (!draftStr) return false;

        try {
            const draft = JSON.parse(draftStr);
            setObjective(draft.objective || '');
            setObjectiveType(draft.objectiveType || 'general');
            setSubjects(draft.subjects || []);
            setMaterials(draft.materials || []);
            return true;
        } catch (e) {
            console.error('Failed to restore draft plan', e);
            return false;
        }
    };

    const clearDraftPlan = () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('study_plan_draft');
    };

    return (
        <AppContext.Provider value={{
            userPlan,
            setUserPlan,
            library,
            addToLibrary,
            updateProgress,
            toggleFavorite,
            isLoading,
            objective,
            setObjective,
            objectiveType,
            setObjectiveType,
            subjects,
            setSubjects,
            materials,
            setMaterials,
            generatedPlan,
            setGeneratedPlan,
            saveDraftPlan,
            restoreDraftPlan,
            clearDraftPlan
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
