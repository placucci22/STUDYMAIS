import { Material } from "@/context/AppContext";

// --- REAL BACKEND ACTIONS (Next.js API Routes) ---

export async function analyze_pdf(file: File): Promise<{ title: string; chapters: string[]; raw_text: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze PDF');
    }

    const data = await response.json();

    // Simple heuristic for title (first line or filename)
    const title = data.text.split('\n')[0].substring(0, 50) || file.name.replace('.pdf', '');

    return {
        title: title,
        chapters: ["Conteúdo Completo"], // We are processing the whole text for now
        raw_text: data.text
    };
}

export async function generate_script(params: { module_title: string; module_context: string; raw_text?: string }): Promise<{ script_text: string }> {
    // If we don't have raw_text passed, we can't generate. 
    if (!params.raw_text) {
        return { script_text: "Este é um conteúdo de demonstração. O texto original não está disponível para geração via IA." };
    }

    const response = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: params.raw_text,
            module_title: params.module_title
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate script');
    }

    const data = await response.json();
    return { script_text: data.script };
}

export async function generate_audio(params: { script_text: string; voice_id?: string }): Promise<{ audio_url: string; duration: number }> {
    const response = await fetch('/api/generate/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: params.script_text }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate audio');
    }

    const data = await response.json();
    return {
        audio_url: data.audioUrl,
        duration: 0 // Duration will be calculated by the player when metadata loads
    };
}

export async function generate_quiz(params: { script_text: string }): Promise<{ questions: any[] }> {
    // Mocked Quiz for now to save complexity/tokens
    await new Promise(r => setTimeout(r, 1500));
    return {
        questions: [
            {
                id: 1,
                question: "Qual o conceito principal abordado?",
                options: ["Neuroplasticidade", "Computação Quântica", "Direito Romano", "Fotossíntese"],
                correct_index: 0,
                explanation: "O texto foca na capacidade do cérebro de se adaptar."
            },
            {
                id: 2,
                question: "Segundo o roteiro, o que é essencial para o aprendizado?",
                options: ["Dormir 12h", "Repetição Espaçada", "Comer Carboidratos", "Ouvir Música"],
                correct_index: 1,
                explanation: "A repetição espaçada foi citada como chave para a memória."
            }
        ]
    };
}

export async function ask_doubt(params: { context: string; question: string }): Promise<{ answer: string }> {
    // Mocked Doubt for now
    await new Promise(r => setTimeout(r, 1000));
    return { answer: "Essa é uma excelente pergunta. Baseado no conteúdo, a resposta seria..." };
}

export function track_event(event_name: string, properties: any = {}) {
    if (typeof window !== 'undefined') {
        console.log(`[TRACKING] ${event_name}`, properties);
    }
}
