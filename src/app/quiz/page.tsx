"use client";

import { useQuiz } from "@/hooks/useQuiz";
import { Card, Button, ProgressBar } from "@/components/ui";
import { BrainCircuit, Check, X, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
    const {
        status, currentQuestion, currentIndex, totalQuestions, score, feedback,
        startQuiz, submitAnswer, nextQuestion
    } = useQuiz();

    const router = useRouter();

    useEffect(() => {
        if (status === 'idle') {
            startQuiz("Contexto simulado para quiz");
        }
    }, [status]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-6">
                <Loader2 className="w-10 h-10 text-synapse-500 animate-spin" />
                <p className="text-neural-400 animate-pulse">Gerando Desafio Cognitivo...</p>
            </div>
        );
    }

    if (status === 'completed') {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center space-y-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-24 w-24 rounded-full bg-synapse-500/20 flex items-center justify-center"
                >
                    <BrainCircuit className="w-12 h-12 text-synapse-500" />
                </motion.div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">{score}/{totalQuestions}</h2>
                    <p className="text-neural-400">Pontuação Final</p>
                </div>

                <div className="w-full max-w-xs space-y-3">
                    <Button className="w-full" onClick={() => startQuiz("Novo contexto")}>
                        Novo Desafio
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
                        Voltar para Home
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="p-6 pt-12 flex flex-col h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-medium text-neural-500 uppercase tracking-wider">
                    Questão {currentIndex + 1}/{totalQuestions}
                </span>
                <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-synapse-500" />
                    <span className="text-sm font-bold text-white">{score} pts</span>
                </div>
            </div>

            {/* Progress */}
            <ProgressBar progress={((currentIndex) / totalQuestions) * 100} className="mb-8" />

            {/* Question Card */}
            <div className="flex-1 flex flex-col justify-center space-y-8">
                <h2 className="text-xl font-bold text-white leading-relaxed">
                    {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = false; // We don't track selection visually until feedback
                        // Actually we should track if this specific option was selected
                        // But for simplicity let's just show feedback state

                        let variant: 'secondary' | 'primary' | 'danger' = 'secondary';
                        if (feedback) {
                            if (idx === currentQuestion.correct_index) variant = 'primary'; // Show correct
                            else if (feedback.type === 'incorrect' && idx !== currentQuestion.correct_index) variant = 'secondary'; // Keep others neutral
                            // If we wanted to show the wrong selection as red, we'd need to know which one was clicked.
                            // For now, let's just highlight the correct one green.
                        }

                        return (
                            <motion.button
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => submitAnswer(idx)}
                                disabled={!!feedback}
                                className={`
                  w-full p-4 rounded-xl text-left text-sm font-medium transition-all duration-200 border
                  ${feedback && idx === currentQuestion.correct_index
                                        ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                        : 'bg-void-800 border-neural-700/50 text-neural-200 hover:bg-void-700 hover:border-neural-600'}
                `}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {feedback && idx === currentQuestion.correct_index && (
                                        <Check className="w-4 h-4 text-green-400" />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback Overlay */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`
              fixed bottom-24 left-6 right-6 p-4 rounded-2xl backdrop-blur-xl border shadow-2xl z-50
              ${feedback.type === 'correct' ? 'bg-green-900/80 border-green-500/30' : 'bg-red-900/80 border-red-500/30'}
            `}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`
                h-8 w-8 rounded-full flex items-center justify-center shrink-0
                ${feedback.type === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
              `}>
                                {feedback.type === 'correct' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="font-bold text-white">
                                    {feedback.type === 'correct' ? 'Correto!' : 'Incorreto'}
                                </p>
                                <p className="text-xs text-white/80 leading-relaxed">
                                    {feedback.message}
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border-none"
                            onClick={nextQuestion}
                        >
                            Continuar <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
