"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, ArrowRight, Check, Sparkles, BookOpen, GraduationCap, Target, Briefcase, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StudyPlanDraft } from "@/context/AppContext";

const GOALS = [
    { id: 'vestibular', label: 'Vestibular', icon: GraduationCap },
    { id: 'enem', label: 'ENEM', icon: BookOpen },
    { id: 'faculdade', label: 'Faculdade', icon: GraduationCap },
    { id: 'concurso', label: 'Concurso Público', icon: Briefcase },
    { id: 'certificacao', label: 'Certificação', icon: Target },
    { id: 'pessoal', label: 'Estudo Pessoal', icon: User },
];

const SUBJECTS = [
    "Português", "Matemática", "História", "Geografia", "Biologia",
    "Física", "Química", "Filosofia", "Sociologia", "Redação", "Inglês"
];

import { generateStudyPlan } from "@/lib/backend/studyPlan";

export default function SetupPage() {
    const { setStudyPlan } = useApp();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    const [draft, setDraft] = useState<StudyPlanDraft>({
        goal: '',
        subjects: [],
        materials: []
    });

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
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

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const toggleSubject = (subject: string) => {
        setDraft(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    return (
        <div className="min-h-screen p-6 pt-12 pb-24 max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-neural-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">Configurar Estudo</h1>
                        <p className="text-xs text-neural-500">Passo {step} de 4</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-neural-100' : 'bg-neural-800'}`}
                        />
                    ))}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {/* STEP 1: GOAL */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Qual é o seu objetivo?</h2>
                            <p className="text-neural-400">Isso ajuda a IA a definir o tom e a profundidade das aulas.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {GOALS.map((goal) => {
                                const Icon = goal.icon;
                                const isSelected = draft.goal === goal.id;
                                return (
                                    <Card
                                        key={goal.id}
                                        onClick={() => setDraft(prev => ({ ...prev, goal: goal.id }))}
                                        className={`p-4 cursor-pointer transition-all border-2 ${isSelected
                                            ? 'border-neural-100 bg-neural-800'
                                            : 'border-transparent hover:border-neural-700'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div className={`p-3 rounded-full ${isSelected ? 'bg-white text-neural-900' : 'bg-neural-800 text-neural-400'}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-neural-300'}`}>
                                                {goal.label}
                                            </span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                size="lg"
                                disabled={!draft.goal}
                                onClick={handleNext}
                                className="w-full sm:w-auto"
                            >
                                Próximo <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: SUBJECTS */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">O que vamos estudar?</h2>
                            <p className="text-neural-400">Selecione as matérias que farão parte do seu plano.</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {SUBJECTS.map((subject) => {
                                const isSelected = draft.subjects.includes(subject);
                                return (
                                    <button
                                        key={subject}
                                        onClick={() => toggleSubject(subject)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${isSelected
                                            ? 'bg-white text-neural-900 border-white'
                                            : 'bg-neural-900/50 text-neural-400 border-neural-700 hover:border-neural-500'
                                            }`}
                                    >
                                        {subject}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-8 flex justify-between">
                            <Button variant="ghost" onClick={handleBack}>
                                Voltar
                            </Button>
                            <Button
                                size="lg"
                                disabled={draft.subjects.length === 0}
                                onClick={handleNext}
                            >
                                Próximo <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
                {/* STEP 3: MATERIALS */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Materiais de Estudo</h2>
                            <p className="text-neural-400">Adicione arquivos, links ou anotações para cada matéria.</p>
                        </div>

                        <div className="space-y-4">
                            {draft.subjects.map((subject) => (
                                <SubjectMaterialBlock
                                    key={subject}
                                    subject={subject}
                                    onAddMaterial={(material) => {
                                        setDraft(prev => ({
                                            ...prev,
                                            materials: [...prev.materials, material]
                                        }));
                                    }}
                                    materials={draft.materials.filter(m => m.subject === subject)}
                                    onRemoveMaterial={(id) => {
                                        setDraft(prev => ({
                                            ...prev,
                                            materials: prev.materials.filter(m => m.id !== id)
                                        }));
                                    }}
                                />
                            ))}
                        </div>

                        <div className="pt-8 flex justify-between">
                            <Button variant="ghost" onClick={handleBack}>
                                Voltar
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleNext}
                            >
                                Revisar Plano <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: REVIEW */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Tudo pronto?</h2>
                            <p className="text-neural-400">Revise seu plano antes de gerarmos as aulas.</p>
                        </div>

                        <Card className="p-6 space-y-4 bg-neural-900/50 border-neural-700">
                            <div>
                                <h3 className="text-sm font-medium text-neural-500 uppercase">Objetivo</h3>
                                <p className="text-lg text-white font-semibold">
                                    {GOALS.find(g => g.id === draft.goal)?.label}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-neural-500 uppercase">Matérias ({draft.subjects.length})</h3>
                                <div className="flex flex-wrap gap-2">
                                    {draft.subjects.map(s => (
                                        <span key={s} className="px-2 py-1 rounded bg-neural-800 text-neural-300 text-sm border border-neural-700">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-neural-500 uppercase">Materiais ({draft.materials.length})</h3>
                                <ul className="space-y-1">
                                    {draft.materials.map(m => (
                                        <li key={m.id} className="text-sm text-neural-400 flex items-center gap-2">
                                            <Check className="w-3 h-3 text-green-500" />
                                            <span className="text-neural-300 font-medium">{m.subject}:</span>
                                            <span className="truncate max-w-[200px]">{m.title || m.type}</span>
                                        </li>
                                    ))}
                                    {draft.materials.length === 0 && (
                                        <li className="text-sm text-neural-500 italic">Nenhum material adicionado (a IA usará conhecimento geral).</li>
                                    )}
                                </ul>
                            </div>
                        </Card>

                        <div className="pt-4 flex justify-between items-center">
                            <Button variant="ghost" onClick={handleBack}>
                                Voltar
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleGenerate}
                                className="bg-white text-neural-900 hover:bg-neural-100"
                            >
                                <Sparkles className="mr-2 w-4 h-4" />
                                Gerar Plano de Estudo
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- SUBCOMPONENTS ---

import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Link as LinkIcon, FileText, FileUp } from "lucide-react";
import { StudyMaterial } from "@/context/AppContext";

function SubjectMaterialBlock({ subject, onAddMaterial, materials, onRemoveMaterial }: {
    subject: string,
    onAddMaterial: (m: StudyMaterial) => void,
    materials: StudyMaterial[],
    onRemoveMaterial: (id: string) => void
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName);

            onAddMaterial({
                id: Math.random().toString(36).substr(2, 9),
                subject,
                type: 'pdf',
                source: 'upload',
                title: file.name,
                url: publicUrl
            });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erro ao fazer upload. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddLink = () => {
        if (!linkUrl) return;
        onAddMaterial({
            id: Math.random().toString(36).substr(2, 9),
            subject,
            type: 'link',
            source: 'manual',
            title: linkUrl,
            url: linkUrl
        });
        setLinkUrl("");
        setShowLinkInput(false);
    };

    return (
        <Card className="overflow-hidden border-neural-800">
            <div
                className="p-4 flex items-center justify-between bg-neural-900/30 cursor-pointer hover:bg-neural-800/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-neural-800 flex items-center justify-center text-neural-400 font-bold text-xs">
                        {subject.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">{subject}</h3>
                        <p className="text-xs text-neural-500">{materials.length} materiais</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                </Button>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4 bg-neural-900/10 border-t border-neural-800">
                    {/* Material List */}
                    {materials.length > 0 && (
                        <div className="space-y-2">
                            {materials.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-2 rounded bg-neural-800/50 border border-neural-700/50 text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        {m.type === 'pdf' && <FileText className="w-3 h-3 text-blue-400" />}
                                        {m.type === 'link' && <LinkIcon className="w-3 h-3 text-purple-400" />}
                                        <span className="text-neural-300 truncate max-w-[150px]">{m.title}</span>
                                    </div>
                                    <button onClick={() => onRemoveMaterial(m.id)} className="text-neural-500 hover:text-red-400">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            <Button size="sm" variant="secondary" className="w-full" disabled={isUploading}>
                                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileUp className="w-3 h-3 mr-2" />}
                                PDF
                            </Button>
                        </div>

                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowLinkInput(!showLinkInput)}
                        >
                            <LinkIcon className="w-3 h-3 mr-2" /> Link
                        </Button>
                    </div>

                    {showLinkInput && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 bg-neural-900 border border-neural-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-neural-500"
                            />
                            <Button size="sm" onClick={handleAddLink}>OK</Button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
