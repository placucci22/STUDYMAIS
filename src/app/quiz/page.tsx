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
        <div className="p-6 pt-12 flex flex-col h-[calc(100vh-80px)] max-w-md mx-auto w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-medium text-neural-500 uppercase tracking-wider">
                    Questão {currentIndex + 1}/{totalQuestions}
                </span>
                <div className="flex items-center gap-2 bg-neural-900/50 px-3 py-1 rounded-full border border-neural-800">
                    <BrainCircuit className="w-4 h-4 text-synapse-500" />
                    <span className="text-sm font-bold text-white">{score} pts</span>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-8 relative h-1.5 bg-neural-800 rounded-full overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 bottom-0 bg-synapse-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col justify-center space-y-8"
                >
                    <h2 className="text-xl font-bold text-white leading-relaxed">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => submitAnswer(idx)}
                                    disabled={!!feedback}
                                    className={`
                                        w-full p-4 rounded-xl text-left text-sm font-medium transition-all duration-200 border relative overflow-hidden
                                        ${feedback && idx === currentQuestion.correct_index
                                            ? 'bg-green-500/20 border-green-500/50 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                            : 'bg-neural-900/40 border-neural-700/50 text-neural-200 hover:border-neural-500'}
                                    `}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <span>{option}</span>
                                        {feedback && idx === currentQuestion.correct_index && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check className="w-4 h-4 text-green-400" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Feedback Overlay */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={`
                            fixed bottom-24 left-6 right-6 p-5 rounded-2xl backdrop-blur-xl border shadow-2xl z-50 max-w-md mx-auto
                            ${feedback.type === 'correct'
                                ? 'bg-green-900/90 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                                : 'bg-red-900/90 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}
                        `}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`
                                h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
                                ${feedback.type === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                            `}>
                                {feedback.type === 'correct' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="font-bold text-white text-lg">
                                    {feedback.type === 'correct' ? 'Brilhante!' : 'Atenção'}
                                </p>
                                <p className="text-sm text-white/90 leading-relaxed font-medium">
                                    {feedback.message}
                                </p>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            className="w-full mt-5 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm transition-all"
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
