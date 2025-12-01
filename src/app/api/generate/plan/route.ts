import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { goal, subjects, materials, deadline } = await req.json();

    console.log("Generating plan with goal:", goal);
    // Using the latest model available as per user context (Dec 2025)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = `
      Atue como um especialista em educação e criação de currículos.
      Seu objetivo é criar um plano de estudos detalhado e personalizado.

      **Objetivo do Aluno:** ${goal}
      **Matérias/Tópicos:** ${subjects.join(", ")}
      **Tempo Disponível:** ${deadline ? deadline.replace('_', ' ') : 'Não especificado (crie um plano equilibrado)'}
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
      **Regras de Formatação (IMPORTANTE):**
      1. **Distribuição:** Distribua o conteúdo de forma lógica dentro do tempo disponível (${deadline || 'padrão'}).
      2. **Títulos Curtos:** Os títulos das lições e focos do dia devem ser BREVES e DIRETOS (máx 5-7 palavras).
      3. **Resumos Concisos:** As descrições devem ser curtas e objetivas.
      4. **Estrutura:** Crie um plano dia-a-dia.

      **Formato de Saída (JSON Obrigatório):**
      Retorne APENAS um objeto JSON com a seguinte estrutura, sem markdown ou explicações adicionais:
      {
        "schedule": [
          {
            "day": 1,
            "focus": "Título Breve do Foco",
            "tasks": ["Tarefa 1", "Tarefa 2"]
          },
          ...
        ],
        "lessons": [
          {
            "id": "generated-1",
            "subject": "Matéria",
            "title": "Título Curto da Lição",
            "description": "Resumo breve do que será aprendido.",
            "order": 1,
            "status": "unlocked"
          },
          ...
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
  } catch (error: any) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate plan" },
      { status: 500 }
    );
  }
}
