"use client";

import { useState } from 'react';
import { useAppContext, PlanType } from '@/context/AppContext';
import { track_event } from '@/lib/backend/actions';

export function usePaywall() {
    const { userPlan, setUserPlan } = useAppContext();
    // TEMPORARY: Paywall disabled for testing
    const hasAccess = true;
    // const hasAccess = userPlan === 'pro' || userPlan === 'lifetime';
    const [isOpen, setIsOpen] = useState(false);
    const [triggerFeature, setTriggerFeature] = useState<string>('');

    const checkAccess = (feature: string): boolean => {
        // Logic Table
        const GATED_FEATURES = ['neural_voice', 'upload_large', 'unlimited_quiz'];

        if (userPlan === 'pro') return true;
        if (userPlan === 'premium' && feature !== 'neural_voice') return true; // Premium has everything except neural voice? Let's say Pro has Neural.

        // Free Plan Restrictions
        if (GATED_FEATURES.includes(feature)) {
            setTriggerFeature(feature);
            setIsOpen(true);
            track_event('paywall_trigger', { feature, current_plan: userPlan });
            return false;
        }

        return true;
    };

    const upgradePlan = (newPlan: PlanType) => {
        setUserPlan(newPlan);
        setIsOpen(false);
        track_event('conversion', { plan: newPlan, trigger: triggerFeature });
    };

    const closePaywall = () => {
        setIsOpen(false);
        track_event('paywall_dismiss', { trigger: triggerFeature });
    };

    return {
        isOpen,
        triggerFeature,
        checkAccess,
        upgradePlan,
        closePaywall,
        currentPlan: userPlan
    };
}
