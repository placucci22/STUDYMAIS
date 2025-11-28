"use client";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Card, Button, ProgressBar } from "@/components/ui";
import { Play, Upload, BrainCircuit, Sparkles, BookOpen, ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const { library, isLoading, studyPlan } = useApp();
  const { user, isLoading: isAuthLoading } = useAuth();

  const inProgress = library.filter(m => m.status === 'in_progress').sort((a, b) => b.last_accessed - a.last_accessed);
  const hasContent = library.length > 0;

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse-slow text-neural-400">Sincronizando córtex...</div>
      </div>
    );
  }

  // STATE 0: Not Logged In
  if (!user) {
    return (
      <div className="p-6 space-y-8 pt-24 pb-24 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="h-24 w-24 rounded-full bg-neural-800 border border-neural-600 flex items-center justify-center mb-6 shadow-2xl shadow-neural-500/20">
          <BrainCircuit className="w-12 h-12 text-neural-400" />
        </div>

        <div className="space-y-4 max-w-sm">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neural-400">
            Cognitive OS
          </h1>
          <p className="text-neural-400 text-lg">
            Seu sistema operacional de aprendizado.
          </p>
        </div>

        <Link href="/auth/login" className="w-full max-w-xs">
          <Button size="lg" className="w-full h-14 text-lg shadow-xl shadow-neural-500/10">
            Entrar no Sistema <LogIn className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pt-12 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neural-300">
            Olá, Visionário.
          </h1>
          <p className="text-neural-400 text-sm">Seu sistema cognitivo está ativo.</p>
        </div>
        <Link href="/profile">
          <div className="h-10 w-10 rounded-full bg-neural-800 border border-neural-600 flex items-center justify-center hover:bg-neural-700 transition-colors cursor-pointer">
            <BrainCircuit className="w-5 h-5 text-neural-400" />
          </div>
        </Link>
      </header>

      {/* Main Action Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* ALWAYS SHOW: Create New Plan CTA */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neural-900 to-void-900 border border-neural-700/50 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-neural-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-neural-500/20 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-neural-300" />
              </div>
              {studyPlan?.active && (
                <span className="text-xs bg-neural-800 text-neural-400 px-2 py-1 rounded-full border border-neural-700">
                  Novo Estudo
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white leading-tight">
              {studyPlan?.active ? "Criar outro plano de estudo?" : "Vamos estudar do jeito inteligente?"}
            </h2>
            <p className="text-neural-400 text-sm leading-relaxed">
              {studyPlan?.active
                ? "Inicie uma nova jornada sobre outro tema. Seus planos anteriores ficam salvos."
                : "Crie um plano de estudo personalizado com aulas em áudio geradas a partir dos seus materiais."}
            </p>

            <Link href="/setup" className="block pt-2">
              <Button size="lg" className="w-full bg-white text-neural-900 hover:bg-neural-100 font-semibold shadow-lg shadow-white/10">
                {studyPlan?.active ? "Iniciar Novo Plano" : "Começar Estudo Guiado"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ACTIVE PLAN (If exists) */}
        {studyPlan?.active && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neural-500 uppercase tracking-wider">Continuar Estudando</h2>
              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">Em andamento</span>
            </div>

            {(() => {
              // Find next lesson
              const nextLesson = studyPlan.lessons.find(l => l.status !== 'completed') || studyPlan.lessons[studyPlan.lessons.length - 1];

              return (
                <Link href="/player">
                  <Card className="group hover:border-neural-500/50 transition-all cursor-pointer relative overflow-hidden bg-gradient-to-br from-neural-900/80 to-void-900/80 border-neural-700/50">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Play className="w-24 h-24 text-neural-500" />
                    </div>

                    <div className="p-6 space-y-4 relative z-10">
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-neural-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Próxima Sessão
                        </span>
                        <h3 className="text-xl font-bold text-white line-clamp-2">
                          {nextLesson?.title || "Continuar Jornada"}
                        </h3>
                        <p className="text-sm text-neural-400 line-clamp-1">
                          {nextLesson?.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-neural-400">
                          <span>Progresso do Plano</span>
                          <span>
                            {Math.round((studyPlan.lessons.filter(l => l.status === 'completed').length / studyPlan.lessons.length) * 100)}%
                          </span>
                        </div>
                        <ProgressBar
                          progress={(studyPlan.lessons.filter(l => l.status === 'completed').length / studyPlan.lessons.length) * 100}
                          className="h-2"
                        />
                      </div>

                      <Button className="w-full mt-2" variant="secondary">
                        {nextLesson?.status === 'in_progress' ? "Retomar Aula" : "Ir para o Player"}
                      </Button>
                    </div>
                  </Card>
                </Link>
              );
            })()}
          </section>
        )}

        {/* RECENT LIBRARY ITEMS */}
        {hasContent && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-neural-400">Recentes</h3>
              <Link href="/library" className="text-xs text-neural-500 hover:text-white transition-colors">
                Ver tudo
              </Link>
            </div>

            <div className="space-y-2">
              {library.slice(0, 3).map((item) => (
                <Link href="/player" key={item.id}>
                  <Card className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer border-transparent hover:border-neural-700/50">
                    <div
                      className="h-10 w-10 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: item.cover_color }}
                    >
                      {item.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-neural-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {item.modules_count}
                        </span>
                        {item.status === 'completed' && (
                          <span className="text-green-500">Concluído</span>
                        )}
                      </div>
                    </div>
                    <div className="text-neural-600">
                      <Play className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
