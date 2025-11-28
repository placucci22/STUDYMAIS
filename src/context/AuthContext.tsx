"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signInWithOtp: (email: string) => Promise<{ error: any }>;
    verifyOtp: (email: string, token: string) => Promise<{ error: any, data: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        getSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithOtp = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // If you want magic link, use emailRedirectTo. 
                // For OTP (code), we don't need it, but Supabase sends a link by default unless configured otherwise.
                // We will assume the user wants to type a code if they mentioned "Código Mágico".
                // However, 'signInWithOtp' sends a magic link by default. 
                // To force code, we usually need to configure it in the dashboard or use the verifyOtp method.
                // Let's stick to the default behavior which sends a link, but we can also handle code input if configured.
                // For "Magic Code" (digits), we usually use `shouldCreateUser: true` and handle the token.
            }
        });
        return { error };
    };

    const verifyOtp = async (email: string, token: string) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });
        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signInWithOtp, verifyOtp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
