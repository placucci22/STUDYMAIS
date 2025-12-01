"use client";

import { useState, useEffect, Suspense } from 'react';
import { Card, Button, ProgressBar } from '@/components/ui';
import { ArrowRight, ArrowLeft, Upload, Link as LinkIcon, FileText, Loader2, Sparkles, Book, CheckCircle2, Target, BrainCircuit, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext, StudyMaterial } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateStudyPlan } from '@/lib/backend/studyPlan';

// --- STEPS ---
// 1. Objective (Cards + Text)
// 2. Subjects (Text + Chips)
// 3. Details (Per Subject Text)
// 4. Materials (PDF, Link, Book Text)
// 5. Generation

const OBJECTIVE_SUGGESTIONS = [
    { id: 'enem', label: 'ENEM', icon: Target },
    { id: 'vestibular', label: 'Vestibular', icon: Book },
    { id: 'faculdade', label: 'Faculdade', icon: Library },
    { id: 'concurso', label: 'Concurso', icon: CheckCircle2 },
    { id: 'prova_amanha', label: 'Prova Amanhã', icon: Sparkles },
    { id: 'reforco', label: 'Reforço Geral', icon: BrainCircuit },
];

const SUBJECT_CHIPS = [
    "Exatas", "Humanas", "Saúde", "Direito", "Tecnologia", "Concursos", "Educação"
];

// Define Draft Type locally if not exported
interface StudyPlanDraft {
    goal: string;
    subjects: string[];
    materials: StudyMaterial[];
}

function SetupContent() {
    const {
        saveDraftPlan,
        restoreDraftPlan,
        clearDraftPlan,
        // Context State
        objective, setObjective,
        objectiveType, setObjectiveType,
        subjects, setSubjects,
        materials, setMaterials,
        setGeneratedPlan
    } = useAppContext();

    const { user, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    // Local UI state (derived or temporary)
    const [subjectsText, setSubjectsText] = useState("");
    const [selectedChips, setSelectedChips] = useState<string[]>([]);
    const [subjectDetails, setSubjectDetails] = useState<Record<string, string>>({});

    const [isUploading, setIsUploading] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [showBookInput, setShowBookInput] = useState(false);
    const [bookText, setBookText] = useState("");

    // --- EFFECTS ---

    // 1. Check for 'action=restore' param on mount
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'restore') {
            const restored = restoreDraftPlan();
            if (restored) {
                // If restored successfully, we should be ready to generate
                // But we need to make sure state is updated.
                // Let's jump to the last step or trigger generation?
                // For now, let's just go to step 5 (Generation)
                setStep(5);
                // Auto-trigger generation?
                // handleGenerate(); // Might be risky if state isn't ready
            }
        }
    }, [searchParams, restoreDraftPlan]);

    // 2. Auto-trigger generation if we are at step 5 and authenticated
    useEffect(() => {
        if (step === 5 && user && !isGenerating) {
            handleGenerate();
        }
    }, [step, user, isGenerating]);

    // Sync local subjects text/chips to context subjects
    useEffect(() => {
        // Simple heuristic parsing for subjects
        const raw = subjectsText.split(/,|\n| e /).map(s => s.trim()).filter(s => s.length > 2);
        const combined = Array.from(new Set([...raw, ...selectedChips]));
        // We don't auto-set context here to avoid loop, only on Next
    }, [subjectsText, selectedChips]);

    // --- HANDLERS ---

    const handleNext = () => {
        if (step === 2) {
            const raw = subjectsText.split(/,|\n| e /).map(s => s.trim()).filter(s => s.length > 2);
            const combined = Array.from(new Set([...raw, ...selectedChips]));
            setSubjects(combined.length > 0 ? combined : ["Geral"]);
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => setStep(prev => prev - 1);

    const toggleChip = (chip: string) => {
        if (selectedChips.includes(chip)) {
            setSelectedChips(prev => prev.filter(c => c !== chip));
        } else {
            setSelectedChips(prev => [...prev, chip]);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setIsUploading(true);

        try {
            const fileName = `user_upload_${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
                .from('documents')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(fileName);

            setMaterials([...materials, {
                id: Date.now().toString(),
                name: file.name,
                type: 'pdf',
                url: publicUrl
            }]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erro no upload. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };

    const addLink = () => {
        if (!linkUrl) return;
        setMaterials([...materials, {
            id: Date.now().toString(),
            name: linkUrl,
            type: 'link',
            url: linkUrl
        }]);
        setLinkUrl("");
        setShowLinkInput(false);
    };

    const addBook = () => {
        if (!bookText) return;
        setMaterials([...materials, {
            id: Date.now().toString(),
            name: bookText.slice(0, 30) + "...",
            type: 'text',
            content: bookText
        }]);
        setBookText("");
        setShowBookInput(false);
    };

    // --- RENDER STEPS ---

    // New Step: Time Availability
    const [deadline, setDeadline] = useState<string>('1_week');

    const renderStep5 = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Quanto tempo você tem?</h2>
                <p className="text-neural-400">Isso ajuda a IA a distribuir o conteúdo de forma equilibrada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: '1_week', label: '1 Semana', desc: 'Intensivo rápido' },
                    { id: '2_weeks', label: '2 Semanas', desc: 'Ritmo moderado' },
                    { id: '1_month', label: '1 Mês', desc: 'Aprofundado' },
                    { id: '3_months', label: '3 Meses', desc: 'Longo prazo' },
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setDeadline(opt.id)}
                        className={`
                            p-4 rounded-xl border text-left transition-all
                            ${deadline === opt.id
                                ? 'bg-neural-600 border-neural-500 text-white shadow-lg'
                                : 'bg-void-800 border-neural-800 text-neural-400 hover:border-neural-600'}
                        `}
                    >
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-xs opacity-70">{opt.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="text-center space-y-8 py-12">
            <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-neural-500/20 rounded-full animate-ping" />
                <div className="relative bg-neural-900 rounded-full p-6 border border-neural-700 shadow-2xl">
                    <BrainCircuit className="w-20 h-20 text-neural-400 animate-pulse" />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">Criando seu Plano Neural</h2>
                <p className="text-neural-400 max-w-md mx-auto">
                    Nossa IA está analisando seu perfil, objetivos e materiais para construir a estratégia perfeita.
                </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2">
                <div className="h-1 w-full bg-void-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-neural-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                </div>
                <p className="text-xs text-neural-500 font-mono">PROCESSANDO DADOS...</p>
            </div>
        </div>
    );

    const handleGenerate = async () => {
        if (!user) {
            saveDraftPlan();
            const { error } = await signInWithGoogle('/setup?action=restore');
            if (error) {
                console.error("Login error:", error);
                alert("Erro ao iniciar login.");
            }
            return;
        }

        setIsGenerating(true);
        try {
            const draft: StudyPlanDraft = {
                goal: objectiveType === 'general' ? objective : `${objectiveType}: ${objective}`,
                subjects: subjects,
                materials: materials,
                deadline: deadline // Include deadline
            };

            const detailsContext = Object.entries(subjectDetails)
                .map(([subj, det]) => `${subj}: ${det}`)
                .join("\n");

            draft.goal += `\n\nDetalhes:\n${detailsContext}`;

            const newPlan = await generateStudyPlan(draft);
            setGeneratedPlan(newPlan);
            clearDraftPlan();
            router.push('/');
        } catch (error) {
            console.error("Failed to generate plan", error);
            alert("Erro ao gerar plano. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Update step rendering logic
    const renderCurrentStep = () => {
        switch (step) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            case 5: return renderStep5(); // Deadline Step
            case 6: return renderStep6(); // Generation
            default: return null;
        }
    };

    // --- RENDER STEPS ---

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Qual é seu objetivo agora?</h2>
                <p className="text-neural-400">Selecione uma categoria ou descreva sua meta.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {OBJECTIVE_SUGGESTIONS.map(obj => (
                    <button
                        key={obj.id}
                        onClick={() => setObjectiveType(obj.label as any)} // Cast to any to avoid strict type check for now
                        className={`
                            p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                            ${objectiveType === obj.label
                                ? 'bg-neural-600 border-neural-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                                : 'bg-void-800 border-neural-800 text-neural-400 hover:border-neural-600 hover:bg-void-800/80'}
                        `}
                    >
                        <obj.icon className={`w-6 h-6 ${objectiveType === obj.label ? 'text-neural-300' : 'text-neural-600'}`} />
                        <span className="font-medium text-sm">{obj.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-neural-300">Descreva seu objetivo em detalhes</label>
                <textarea
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Ex: Passar em Direito Constitucional básico, aprender Logaritmos, revisar Hist. Contemporânea..."
                    className="w-full h-32 bg-void-800 border border-neural-800 rounded-xl p-4 text-white placeholder:text-neural-600 focus:border-neural-500 focus:ring-1 focus:ring-neural-500 outline-none resize-none transition-all"
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Quais matérias você precisa estudar?</h2>
                <p className="text-neural-400">Liste os tópicos ou selecione áreas gerais.</p>
            </div>

            <textarea
                value={subjectsText}
                onChange={(e) => setSubjectsText(e.target.value)}
                placeholder="Ex: Revisar função quadrática e probabilidade, História da Guerra Fria..."
                className="w-full h-32 bg-void-800 border border-neural-800 rounded-xl p-4 text-white placeholder:text-neural-600 focus:border-neural-500 focus:ring-1 focus:ring-neural-500 outline-none resize-none transition-all"
            />

            <div className="flex flex-wrap gap-2">
                {SUBJECT_CHIPS.map(chip => (
                    <button
                        key={chip}
                        onClick={() => toggleChip(chip)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium border transition-all
                            ${selectedChips.includes(chip)
                                ? 'bg-neural-600 text-white border-neural-500'
                                : 'bg-void-800 text-neural-400 border-neural-800 hover:border-neural-600'}
                        `}
                    >
                        {chip}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">O que focar em cada matéria?</h2>
                <p className="text-neural-400">Detalhe os subtópicos para a IA ser mais precisa.</p>
            </div>

            <div className="space-y-6">
                {subjects.map((subject, idx) => (
                    <div key={idx} className="space-y-2">
                        <h3 className="text-lg font-medium text-neural-200 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-neural-500" />
                            {subject}
                        </h3>
                        <textarea
                            value={subjectDetails[subject] || ""}
                            onChange={(e) => setSubjectDetails(prev => ({ ...prev, [subject]: e.target.value }))}
                            placeholder={`Ex: Tópicos específicos de ${subject}...`}
                            className="w-full h-24 bg-void-800 border border-neural-800 rounded-xl p-3 text-sm text-white placeholder:text-neural-600 focus:border-neural-500 outline-none resize-none transition-all"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Adicione seus materiais</h2>
                <p className="text-neural-400">PDFs, Links ou Referências de Livros. (Opcional)</p>
            </div>

            {/* Material List */}
            <div className="space-y-3">
                {materials.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-void-800 border border-neural-800">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-lg bg-neural-700 flex items-center justify-center shrink-0">
                                {m.type === 'pdf' && <FileText className="w-5 h-5 text-blue-400" />}
                                {m.type === 'link' && <LinkIcon className="w-5 h-5 text-green-400" />}
                                {m.type === 'text' && <Book className="w-5 h-5 text-yellow-400" />}
                            </div>
                            <span className="text-sm text-neural-200 truncate">{m.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMaterials(materials.filter(mat => mat.id !== m.id))}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                            Remover
                        </Button>
                    </div>
                ))}

                {materials.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-neural-800 rounded-xl flex flex-col items-center justify-center text-center gap-2 text-neural-500">
                        <Library className="w-8 h-8 opacity-50" />
                        <p className="text-sm">Nenhum material adicionado.<br />A IA usará seus objetivos para criar o conteúdo.</p>
                    </div>
                )}
            </div>

            {/* Add Actions */}
            <div className="grid grid-cols-3 gap-3">
                <label className="cursor-pointer p-4 rounded-xl border border-dashed border-neural-700 hover:border-neural-500 hover:bg-neural-800/50 flex flex-col items-center gap-2 transition-all">
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-neural-400" /> : <Upload className="w-6 h-6 text-neural-400" />}
                    <span className="text-xs font-medium text-neural-400">Upload PDF</span>
                </label>

                <button
                    onClick={() => setShowLinkInput(true)}
                    className="p-4 rounded-xl border border-dashed border-neural-700 hover:border-neural-500 hover:bg-neural-800/50 flex flex-col items-center gap-2 transition-all"
                >
                    <LinkIcon className="w-6 h-6 text-neural-400" />
                    <span className="text-xs font-medium text-neural-400">Link</span>
                </button>

                <button
                    onClick={() => setShowBookInput(true)}
                    className="p-4 rounded-xl border border-dashed border-neural-700 hover:border-neural-500 hover:bg-neural-800/50 flex flex-col items-center gap-2 transition-all"
                >
                    <Book className="w-6 h-6 text-neural-400" />
                    <span className="text-xs font-medium text-neural-400">Livro/Texto</span>
                </button>
            </div>

            {/* Inputs */}
            <AnimatePresence>
                {showLinkInput && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-void-800 rounded-xl border border-neural-700 space-y-3">
                        <input
                            type="text"
                            placeholder="Cole o link aqui..."
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            className="w-full bg-neural-900/50 border border-neural-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-neural-500"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowLinkInput(false)}>Cancelar</Button>
                            <Button size="sm" onClick={addLink}>Adicionar</Button>
                        </div>
                    </motion.div>
                )}
                {showBookInput && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-void-800 rounded-xl border border-neural-700 space-y-3">
                        <textarea
                            placeholder="Digite o nome do livro, capítulos ou cole um texto..."
                            value={bookText}
                            onChange={e => setBookText(e.target.value)}
                            className="w-full h-24 bg-neural-900/50 border border-neural-700 rounded-lg p-3 text-sm text-white outline-none focus:border-neural-500 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowBookInput(false)}>Cancelar</Button>
                            <Button size="sm" onClick={addBook}>Adicionar</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderStep5 = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <div className="relative">
                <div className="absolute inset-0 bg-neural-500/20 blur-3xl rounded-full animate-pulse-slow" />
                <BrainCircuit className="w-24 h-24 text-white relative z-10 animate-float" />
            </div>
            <div className="space-y-3 max-w-md">
                <h2 className="text-2xl font-bold text-white">
                    {isGenerating ? "Sintetizando Plano Neural..." : "Tudo pronto!"}
                </h2>
                <p className="text-neural-400">
                    {isGenerating
                        ? "Nossa IA está analisando seus objetivos e materiais para criar o cronograma perfeito."
                        : "Clique abaixo para gerar seu plano de estudos personalizado."}
                </p>
            </div>
            {!isGenerating && (
                <Button size="lg" onClick={handleGenerate} className="w-full max-w-xs shadow-xl shadow-neural-500/20">
                    <Sparkles className="w-5 h-5 mr-2" /> Gerar Plano
                </Button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-void-950 text-white p-6 pb-24">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 1} className={step === 1 ? 'opacity-0' : ''}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-neural-500 uppercase tracking-widest">Passo {step} de 5</span>
                    <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} className={`h-1 w-8 rounded-full transition-all ${s <= step ? 'bg-neural-500' : 'bg-neural-800'}`} />
                        ))}
                    </div>
                </div>
                <div className="w-20" /> {/* Spacer */}
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        {step === 5 && renderStep5()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Actions */}
            {step < 5 && (
                <footer className="fixed bottom-0 left-0 right-0 p-6 bg-void-950/80 backdrop-blur-lg border-t border-neural-800 z-50">
                    <div className="max-w-2xl mx-auto flex justify-end">
                        <Button
                            size="lg"
                            onClick={handleNext}
                            disabled={
                                (step === 1 && !objective && !objectiveType) ||
                                (step === 2 && !subjectsText && selectedChips.length === 0)
                            }
                            className="shadow-lg shadow-neural-500/20"
                        >
                            Continuar <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default function SetupPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-neural-400">Carregando...</div>}>
            <SetupContent />
        </Suspense>
    );
}
