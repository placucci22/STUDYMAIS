"use client";

import { useState } from 'react';
import { Card, Button, ProgressBar } from '@/components/ui';
import { ArrowRight, ArrowLeft, Upload, Link as LinkIcon, FileText, Loader2, Sparkles, Book, CheckCircle2, Target, BrainCircuit, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, StudyPlanDraft, StudyMaterial } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
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

export default function SetupPage() {
    const { setStudyPlan } = useApp();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    // --- STATE ---
    const [objectiveType, setObjectiveType] = useState<string | null>(null);
    const [objectiveText, setObjectiveText] = useState("");

    const [subjectsText, setSubjectsText] = useState("");
    const [selectedChips, setSelectedChips] = useState<string[]>([]);

    const [subjectDetails, setSubjectDetails] = useState<Record<string, string>>({});
    const [parsedSubjects, setParsedSubjects] = useState<string[]>([]);

    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [showBookInput, setShowBookInput] = useState(false);
    const [bookText, setBookText] = useState("");

    // --- HANDLERS ---

    const handleNext = () => {
        if (step === 2) {
            // Simple heuristic parsing for subjects to generate Step 3 tabs
            // Split by comma, newline, or " e "
            const raw = subjectsText.split(/,|\n| e /).map(s => s.trim()).filter(s => s.length > 2);
            // Add chips
            const combined = Array.from(new Set([...raw, ...selectedChips]));
            setParsedSubjects(combined.length > 0 ? combined : ["Geral"]);
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

            setMaterials(prev => [...prev, {
                id: Date.now().toString(),
                subject: "Geral", // We assign to general for now
                type: 'pdf',
                title: file.name,
                url: publicUrl,
                source: 'upload'
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
        setMaterials(prev => [...prev, {
            id: Date.now().toString(),
            subject: "Geral",
            type: 'link',
            title: linkUrl,
            url: linkUrl,
            source: 'link'
        }]);
        setLinkUrl("");
        setShowLinkInput(false);
    };

    const addBook = () => {
        if (!bookText) return;
        setMaterials(prev => [...prev, {
            id: Date.now().toString(),
            subject: "Geral",
            type: 'text',
            title: bookText.slice(0, 30) + "...",
            notes: bookText,
            source: 'text'
        }]);
        setBookText("");
        setShowBookInput(false);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Construct Draft
            const draft: StudyPlanDraft = {
                goal: `${objectiveType ? objectiveType + ": " : ""}${objectiveText}`,
                subjects: parsedSubjects,
                materials: materials
            };

            // We pass details as context in the draft (we might need to update the type or just append to goal)
            // For now, let's append details to the goal/context for the backend to process
            const detailsContext = Object.entries(subjectDetails)
                .map(([subj, det]) => `${subj}: ${det}`)
                .join("\n");

            draft.goal += `\n\nDetalhes:\n${detailsContext}`;

            const newPlan = await generateStudyPlan(draft);
            setStudyPlan(newPlan);
            router.push('/');
        } catch (error) {
            console.error("Failed to generate plan", error);
            alert("Erro ao gerar plano. Tente novamente.");
        } finally {
            setIsGenerating(false);
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
                        onClick={() => setObjectiveType(obj.label)}
                        className={`
                            p-4 rounded-xl border text-left transition-all flex flex-col gap-2
                            ${objectiveType === obj.label
                                ? 'bg-neural-600/20 border-neural-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
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
                    value={objectiveText}
                    onChange={(e) => setObjectiveText(e.target.value)}
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
                {parsedSubjects.map((subject, idx) => (
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
                            <div className="h-10 w-10 rounded-lg bg-neural-900 flex items-center justify-center shrink-0">
                                {m.type === 'pdf' ? <FileText className="w-5 h-5 text-neural-400" /> :
                                    m.type === 'link' ? <LinkIcon className="w-5 h-5 text-neural-400" /> :
                                        <Book className="w-5 h-5 text-neural-400" />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{m.title}</p>
                                <p className="text-xs text-neural-500 capitalize">{m.type}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMaterials(prev => prev.filter(x => x.id !== m.id))}
                            className="text-neural-500 hover:text-red-400 p-2"
                        >
                            <span className="sr-only">Remover</span>
                            &times;
                        </button>
                    </div>
                ))}

                {materials.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-neural-800 rounded-xl flex flex-col items-center justify-center text-center gap-2 text-neural-500">
                        <Library className="w-8 h-8 opacity-50" />
                        <p className="text-sm">Nenhum material adicionado.<br />A IA usará seus objetivos para criar o conteúdo.</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        disabled={isUploading}
                    />
                    <Button variant="secondary" className="w-full h-full flex flex-col gap-1 py-4" disabled={isUploading}>
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        <span className="text-xs">PDF</span>
                    </Button>
                </div>

                <Button variant="secondary" className="w-full h-full flex flex-col gap-1 py-4" onClick={() => setShowLinkInput(true)}>
                    <LinkIcon className="w-5 h-5" />
                    <span className="text-xs">Link</span>
                </Button>

                <Button variant="secondary" className="w-full h-full flex flex-col gap-1 py-4" onClick={() => setShowBookInput(true)}>
                    <Book className="w-5 h-5" />
                    <span className="text-xs">Livro/Texto</span>
                </Button>
            </div>

            {/* Input Modals (Inline) */}
            <AnimatePresence>
                {showLinkInput && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-void-800 rounded-xl border border-neural-700 space-y-3">
                        <input
                            type="text"
                            placeholder="Cole o link aqui..."
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            className="w-full bg-neural-900/50 border border-neural-700 rounded-lg p-2 text-sm text-white outline-none focus:border-neural-500"
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>Cancelar</Button>
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
                            className="w-full h-24 bg-neural-900/50 border border-neural-700 rounded-lg p-2 text-sm text-white outline-none focus:border-neural-500 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setShowBookInput(false)}>Cancelar</Button>
                            <Button size="sm" onClick={addBook}>Adicionar</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 bg-background">
                <div className="relative h-32 w-32">
                    <div className="absolute inset-0 bg-neural-500/20 blur-3xl rounded-full animate-pulse-slow" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full border-4 border-neural-500/30 rounded-full border-t-neural-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BrainCircuit className="w-10 h-10 text-neural-400 animate-pulse" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Criando sua Trilha Neural</h2>
                    <p className="text-neural-400 max-w-xs mx-auto">
                        A IA está analisando seus objetivos e materiais para estruturar o plano perfeito.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-neural-800 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <Button variant="ghost" size="sm" onClick={step === 1 ? () => router.push('/') : handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-neural-500' : 'bg-neural-800'}`} />
                    ))}
                </div>
                <div className="w-20" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-2xl mx-auto w-full pb-32">
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
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent z-40">
                <div className="max-w-2xl mx-auto">
                    <Button
                        size="lg"
                        className="w-full shadow-xl shadow-neural-500/20"
                        onClick={step === 4 ? handleGenerate : handleNext}
                        disabled={step === 1 && !objectiveText && !objectiveType}
                    >
                        {step === 4 ? (
                            <>Gerar Plano de Estudo <Sparkles className="ml-2 w-4 h-4" /></>
                        ) : (
                            <>Continuar <ArrowRight className="ml-2 w-4 h-4" /></>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
