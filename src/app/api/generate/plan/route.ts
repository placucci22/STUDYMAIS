import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { goal, subjects, materials } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = `
      Atue como um especialista em educação e criação de currículos.
      Seu objetivo é criar um plano de estudos detalhado e personalizado.

      **Objetivo do Aluno:** ${goal}
      **Matérias/Tópicos:** ${subjects.join(", ")}
    `;

        if (materials && materials.length > 0) {
            prompt += `
      **Materiais de Apoio Fornecidos:**
      O aluno forneceu os seguintes materiais. Priorize o conteúdo destes materiais ao criar as lições, mas sinta-se livre para complementar com conhecimento externo se necessário para atingir o objetivo.
      ${materials.map((m: any) => `- ${m.title} (${m.type}): ${m.content ? m.content.slice(0, 500) + "..." : "Link/Arquivo"}`).join("\n")}
      `;
        } else {
            prompt += `
      **Sem Materiais de Apoio:**
      O aluno NÃO forneceu materiais específicos.
      Você DEVE atuar como um professor expert e curar o melhor conteúdo possível para este objetivo.
      Crie um currículo estruturado cobrindo os fundamentos até tópicos avançados necessários para o objetivo.
      `;
        }

        prompt += `
      **Formato de Saída (JSON Obrigatório):**
      Retorne APENAS um objeto JSON com a seguinte estrutura, sem markdown ou explicações adicionais:
      {
        "schedule": [
          {
            "day": 1,
            "focus": "Título do Foco do Dia",
            "tasks": ["Tarefa 1", "Tarefa 2", "Tarefa 3"]
          },
          ... (crie um plano para 7 dias ou o necessário para o objetivo)
        ],
        "lessons": [
          {
            "id": "generated-1",
            "subject": "Nome da Matéria",
            "title": "Título da Lição",
            "description": "Descrição detalhada do que será aprendido.",
            "order": 1,
            "status": "unlocked"
          },
          ... (crie lições progressivas cobrindo todo o conteúdo)
        ]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const planData = JSON.parse(cleanJson);

        return NextResponse.json(planData);
    } catch (error) {
        console.error("Error generating plan:", error);
        return NextResponse.json(
            { error: "Failed to generate plan" },
            { status: 500 }
        );
    }
}
