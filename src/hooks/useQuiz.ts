"use client";

import { useState } from 'react';
import { generate_quiz, track_event } from '@/lib/backend/actions';

interface Question {
    id: number;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

interface Feedback {
    type: 'correct' | 'incorrect';
    message: string;
}

export function useQuiz() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'completed' | 'error'>('idle');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, { selectedIndex: number; isCorrect: boolean }>>({});
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const startQuiz = async (scriptText: string) => {
        try {
            setStatus('loading');
            setQuestions([]);
            setAnswers({});
            setScore(0);
            setCurrentIndex(0);

            const result = await generate_quiz({ script_text: scriptText });



            setQuestions(result.questions);
            setStatus('active');

            track_event('quiz_start', { question_count: result.questions.length });

        } catch (err: any) {
            setStatus('error');
            console.error(err);
        }
    };

    const submitAnswer = (optionIndex: number) => {
        if (feedback) return;

        const currentQuestion = questions[currentIndex];
        const isCorrect = optionIndex === currentQuestion.correct_index;

        // Haptic Feedback (Vibration API)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            if (isCorrect) navigator.vibrate(50);
            else navigator.vibrate([50, 50, 50]);
        }

        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: { selectedIndex: optionIndex, isCorrect }
        }));

        setFeedback({
            type: isCorrect ? 'correct' : 'incorrect',
            message: isCorrect
                ? "Você dominou esse conceito."
                : `Ainda não. Vamos ajustar sua compreensão. ${currentQuestion.explanation}`
        });

        if (isCorrect) setScore(prev => prev + 1);
    };

    const nextQuestion = () => {
        setFeedback(null);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setStatus('completed');
        const accuracy = Math.round((score / questions.length) * 100);

        track_event('quiz_complete', { score, total: questions.length, accuracy });
    };

    return {
        status,
        questions,
        currentQuestion: questions[currentIndex],
        currentIndex,
        totalQuestions: questions.length,
        score,
        feedback,
        startQuiz,
        submitAnswer,
        nextQuestion
    };
}
