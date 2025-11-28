/**
 * Backend Actions (Web Mock)
 * Simula a lógica de IA e processamento no navegador.
 */

import { track_event } from './tracking';

// --- TYPES ---
interface AnalyzeResult {
    title: string;
    complexity: string;
    chapters: string[];
    estimated_time: string;
    error?: string;
    message?: string;
}

interface ScriptResult {
    script_text: string;
    length: number;
    error?: string;
    message?: string;
}

interface AudioResult {
    audio_url: string;
    duration: number;
    error?: string;
    message?: string;
}

interface QuizResult {
    questions: any[];
    error?: string;
    message?: string;
}

interface DoubtResult {
    answer: string;
    sources: string[];
    error?: string;
    message?: string;
}

// --- 1. ANALYZE PDF ---

export async function analyze_pdf(file: File): Promise<AnalyzeResult> {
    const ACTION = 'analyze_pdf';
    await track_event('ingest_start', { file: file.name, size: file.size });

    console.log(`[BACKEND] Analyzing ${file.name}...`);

    // Simula latência de upload e processamento (Gemini Flash)
    await new Promise(r => setTimeout(r, 2000));

    // Mock de Erro: Arquivo "corrompido.pdf"
    if (file.name.includes('corrompido')) {
        const error = "Não consegui ler este PDF. Tente uma versão com texto selecionável.";
        await track_event('ingest_fail', { error, file: file.name });
        return { title: '', complexity: '', chapters: [], estimated_time: '', error, message: error };
    }

    // Sucesso Mockado
    const result: AnalyzeResult = {
        title: file.name.replace('.pdf', ''), // Simplificação
        complexity: "Intermediário",
        chapters: ["Introdução", "Conceitos Chave", "Aplicação Prática", "Conclusão"],
        estimated_time: "15 min"
    };

    await track_event('ingest_success', {
        title: result.title,
        complexity: result.complexity,
        chapters_count: result.chapters.length
    });

    return result;
}

// --- 2. GENERATE SCRIPT ---

export async function generate_script({ module_title, module_context }: { module_title: string, module_context: string }): Promise<ScriptResult> {
    const ACTION = 'generate_script';
    console.log(`[INFO] [${ACTION}] Gerando roteiro para: ${module_title} `);

    // Simula latência de LLM (Gemini Pro)
    await new Promise(r => setTimeout(r, 3000));

    const script_text = `
    [Host]: Olá! Bem-vindo ao Cognitive OS. Hoje vamos desvendar ${module_title}.
    [Host]: ${module_context || "O conceito chave aqui é entender como a informação se estrutura."}
    [Host]: Imagine que sua mente é como uma biblioteca...
  `.trim();

    const result: ScriptResult = {
        script_text,
        length: script_text.length
    };

    console.log(`[INFO] [${ACTION}] Roteiro gerado.`, JSON.stringify(result));
    return result;
}

// --- 3. GENERATE AUDIO ---

export async function generate_audio({ script_text, voice_id }: { script_text: string, voice_id: string }): Promise<AudioResult> {
    const ACTION = 'generate_audio';
    console.log(`[INFO] [${ACTION}] Iniciando síntese de voz...`, JSON.stringify({ voice_id }));

    // Simula latência de TTS (ElevenLabs)
    await new Promise(r => setTimeout(r, 4000));

    // Mock de URL de áudio (Placeholder)
    // Em produção, isso viria do bucket S3/Supabase Storage
    const audio_url = `https://cdn.cognitive-os.app/audios/${Date.now()}.mp3`;

    const result: AudioResult = {
        audio_url,
        duration: 120 // 2 minutos fixos para mock
    };

    console.log(`[INFO] [${ACTION}] Áudio gerado com sucesso.`, JSON.stringify(result));
    return result;
}

// --- 4. GENERATE QUIZ ---

export async function generate_quiz({ script_text }: { script_text: string }): Promise<QuizResult> {
    const ACTION = 'generate_quiz';
    console.log(`[INFO] [${ACTION}] Criando desafio cognitivo... `);

    await new Promise(r => setTimeout(r, 1500));

    const result: QuizResult = {
        questions: [
            {
                id: 1,
                question: "Qual a melhor analogia para Plasticidade Neural segundo a aula?",
                options: ["Uma biblioteca em expansão", "Um músculo rígido", "Um computador desligado", "Uma estrada de terra"],
                correct_index: 0,
                explanation: "A analogia da biblioteca reflete como organizamos e expandimos o conhecimento."
            },
            {
                id: 2,
                question: "O que acontece quando deixamos de praticar uma habilidade?",
                options: ["Nada muda", "As conexões sinápticas enfraquecem", "A habilidade se torna permanente", "O cérebro cria novas conexões"],
                correct_index: 1,
                explanation: "Sem uso, as conexões sinápticas enfraquecem, dificultando o acesso àquela informação."
            }
        ]
    };

    console.log(`[INFO] [${ACTION}] Quiz gerado.`, JSON.stringify({ count: result.questions.length }));
    return result;
}

// --- 5. ASK DOUBT ---

export async function ask_doubt({ question, context }: { question: string, context: string }): Promise<DoubtResult> {
    const ACTION = 'ask_doubt';
    console.log(`[INFO] [${ACTION}] Analisando dúvida: ${question}`);

    await new Promise(r => setTimeout(r, 2000));

    const result: DoubtResult = {
        answer: `Essa é uma ótima pergunta! Com base no que vimos sobre ${context}, a resposta é que a repetição espaçada fortalece a memória de longo prazo.`,
        sources: ["Módulo 1: Introdução", "Artigo Científico: Nature 2023"]
    };

    return result;
}

export { track_event };
