"use client";

import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Card, Button, ProgressBar } from "@/components/ui";
import { Play, Upload, BrainCircuit, Sparkles, BookOpen, ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useRouter } from "next/navigation";

export default function Home() {
  const { library, isLoading, generatedPlan } = useAppContext();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const inProgress = library.filter(m => m.status === 'in_progress').sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
  const hasContent = library.length > 0;

  const renderPlan = () => {
    if (!generatedPlan) return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-neural-800/50 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-neural-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Comece sua jornada</h2>
          <p className="text-neural-400">Crie um plano de estudo personalizado com IA</p>
        </div>
        <Button onClick={() => router.push('/setup')} className="shadow-lg shadow-neural-500/20">
          Criar Plano Agora <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Seu Plano de Estudo</h2>
            <p className="text-neural-400 text-sm">Meta: {generatedPlan.goal.split('\n')[0].slice(0, 50)}...</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/setup')}>
            Novo Plano
          </Button>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neural-700 scrollbar-track-transparent">
          {generatedPlan.schedule?.map((day: any, idx: number) => (
            <Card key={idx} className="min-w-[280px] w-[280px] p-5 space-y-4 bg-void-800/50 border-neural-800 snap-center hover:border-neural-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="bg-neural-500/10 text-neural-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Dia {day.day}
                </div>
                {idx === 0 && <span className="text-xs text-green-400 font-medium">Hoje</span>}
              </div>

              <div>
                <h3 className="font-bold text-white text-lg leading-tight line-clamp-2" title={day.focus}>
                  {day.focus}
                </h3>
              </div>

              <div className="space-y-3">
                {day.tasks.slice(0, 3).map((task: string, tIdx: number) => (
                  <div key={tIdx} className="flex items-start gap-3 text-sm text-neural-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-neural-500 mt-1.5 shrink-0" />
                    <span className="line-clamp-2 leading-relaxed">{task}</span>
                  </div>
                ))}
                {day.tasks.length > 3 && (
                  <p className="text-xs text-neural-500 pl-4 italic">
                    + {day.tasks.length - 3} outras tarefas
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse-slow text-neural-400">Sincronizando córtex...</div>
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
        {user ? (
          <Link href="/profile">
            <div className="h-10 w-10 rounded-full bg-neural-800 border border-neural-600 flex items-center justify-center hover:bg-neural-700 transition-colors cursor-pointer">
              <BrainCircuit className="w-5 h-5 text-neural-400" />
            </div>
          </Link>
        ) : (
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-neural-400 hover:text-white">
              Entrar <LogIn className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        )}
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
              {generatedPlan && (
                <span className="text-xs bg-neural-800 text-neural-400 px-2 py-1 rounded-full border border-neural-700">
                  Novo Estudo
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white leading-tight">
              {generatedPlan ? "Criar outro plano de estudo?" : "Vamos estudar do jeito inteligente?"}
            </h2>
            <p className="text-neural-400 text-sm leading-relaxed">
              {generatedPlan
                ? "Inicie uma nova jornada sobre outro tema. Seus planos anteriores ficam salvos."
                : "Crie um plano de estudo personalizado com aulas em áudio geradas a partir dos seus materiais."}
            </p>

            <Link href="/setup" className="block pt-2">
              <Button size="lg" className="w-full bg-white text-neural-900 hover:bg-neural-100 font-semibold shadow-lg shadow-white/10">
                {generatedPlan ? "Iniciar Novo Plano" : "Começar Estudo Guiado"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* RECENT LIBRARY ITEMS */}
        {renderPlan()}
        {hasContent && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-neural-400">Recentes</h3>
              <Link href="/library" className="text-xs text-neural-500 hover:text-white transition-colors">
                Ver tudo
              </Link>
            </div>

            <div className="space-y-2">
              {library.slice(0, 3).map((l) => (
                <Card
                  key={l.id}
                  className="group relative overflow-hidden border-neural-800 bg-void-800/50 hover:border-neural-600 transition-all cursor-pointer"
                  onClick={() => router.push(`/player?id=${l.id}`)}
                >
                  <div className={`h-32 bg-gradient-to-br ${l.coverColor || 'from-gray-800 to-gray-900'} p-4 relative`}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-white truncate shadow-black/50 drop-shadow-md">{l.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/90 mt-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{l.modulesCount || 0} módulos</span>
                      </div>
                    </div>
                    {l.status === 'new' && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-neural-500 text-[10px] font-bold text-white shadow-lg">
                        NOVO
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-neural-400">
                        {l.status === 'completed' ? 'Concluído' : 'Em andamento'}
                      </p>
                    </div>
                    <Play className="w-5 h-5 text-neural-500 group-hover:text-white transition-colors" />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
