"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
    const { isOnline } = useNetwork();

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-void-800 border-b border-neural-700/30"
                >
                    <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs text-neural-300">
                        <WifiOff className="w-3 h-3" />
                        <span>Modo Offline Ativado. Você pode acessar seus downloads.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
