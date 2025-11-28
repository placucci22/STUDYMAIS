
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { text, module_title } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // Fallback to the most stable model if flash fails
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
      Você é um professor especialista e podcaster carismático.
      Seu objetivo é criar um roteiro de podcast educacional curto e envolvente (máximo 500 palavras) baseado no texto fornecido.
      
      TÍTULO DO MÓDULO: ${module_title || 'Assunto Geral'}
      
      DIRETRIZES:
      1. Comece com uma introdução magnética ("Hook").
      2. Explique os conceitos chave de forma simples e analógica.
      3. Use um tom conversacional, direto e inspirador.
      4. Termine com uma conclusão prática ou reflexiva.
      5. NÃO use marcadores de orador (ex: "Host:", "Professor:"). Escreva como um monólogo fluido.
      6. O texto será lido por uma IA, então evite caracteres especiais complexos.
      
      TEXTO BASE:
      ${text.substring(0, 30000)} // Limite de caracteres para segurança
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const script = response.text();

        return NextResponse.json({ script });

    } catch (error: any) {
        console.error('Gemini Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
