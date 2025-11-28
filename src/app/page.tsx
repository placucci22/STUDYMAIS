"use client";

import { useApp } from "@/context/AppContext";
import { Card, Button, ProgressBar } from "@/components/ui";
import { Play, Upload, BrainCircuit, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const { library, isLoading } = useApp();

  const inProgress = library.filter(m => m.status === 'in_progress').sort((a, b) => b.last_accessed - a.last_accessed);
  const hasContent = library.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse-slow text-neural-400">Carregando seu segundo cérebro...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pt-12">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neural-300">
            Bom dia, Visionário.
          </h1>
          <p className="text-neural-400 text-sm">Seu sistema cognitivo está ativo.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-neural-800 border border-neural-600 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-neural-400" />
        </div>
      </header>

      {/* Tabula Rasa (Empty State) */}
      {!hasContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 space-y-6"
        >
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-neural-500/20 blur-3xl rounded-full animate-pulse-slow" />
            <Sparkles className="w-full h-full text-neural-300 opacity-80 animate-float" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Tabula Rasa</h2>
            <p className="text-neural-400 max-w-xs mx-auto">
              Sua mente está pronta para expandir. Comece alimentando o sistema com conhecimento.
            </p>
          </div>
          <Link href="/upload">
            <Button size="lg" className="w-full max-w-xs">
              <Upload className="mr-2 w-5 h-5" />
              Ingerir Primeiro Conteúdo
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Continue Studying */}
      {hasContent && inProgress.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-neural-500 uppercase tracking-wider">Continuar Estudando</h2>
          <Link href="/player">
            <Card className="group hover:border-neural-500/50 transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Play className="w-24 h-24 text-neural-500" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-medium text-neural-400 bg-neural-900/50 px-2 py-1 rounded-full">
                      Módulo Atual
                    </span>
                    <h3 className="text-lg font-semibold text-white mt-2 line-clamp-1">
                      {inProgress[0].title}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neural-400">
                    <span>Progresso</span>
                    <span>{inProgress[0].progress}%</span>
                  </div>
                  <ProgressBar progress={inProgress[0].progress} />
                </div>
              </div>
            </Card>
          </Link>
        </section>
      )}

      {/* Quick Actions */}
      {hasContent && (
        <section className="grid grid-cols-2 gap-4">
          <Link href="/upload">
            <Card className="flex flex-col items-center justify-center gap-3 py-8 hover:bg-white/5 transition-colors cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-neural-500/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-neural-400" />
              </div>
              <span className="font-medium text-sm">Novo Upload</span>
            </Card>
          </Link>
          <Link href="/quiz">
            <Card className="flex flex-col items-center justify-center gap-3 py-8 hover:bg-white/5 transition-colors cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-synapse-500/10 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-synapse-500" />
              </div>
              <span className="font-medium text-sm">Quiz Rápido</span>
            </Card>
          </Link>
        </section>
      )}
    </div>
  );
}
