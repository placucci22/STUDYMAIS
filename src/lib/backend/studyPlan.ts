import { StudyPlanDraft, StudyPlan, Lesson } from "@/context/AppContext";

export async function generateStudyPlan(draft: StudyPlanDraft): Promise<StudyPlan> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lessons: Lesson[] = [];
    let lessonIdCounter = 1;

    // For each subject, generate 1 initial lesson
    for (const subject of draft.subjects) {
        // In a real implementation, we would:
        // 1. Gather all text from materials (PDFs, links, notes)
        // 2. Send to Gemini to generate a curriculum
        // 3. Create lessons based on that curriculum

        lessons.push({
            id: `lesson_${Date.now()}_${lessonIdCounter++}`,
            subject: subject,
            title: `Fundamentos de ${subject}`,
            description: `Uma introdução abrangente aos conceitos chave de ${subject}, baseada nos seus materiais.`,
            order: lessons.length,
            status: lessons.length === 0 ? 'unlocked' : 'locked', // Unlock first lesson
            // audioUrl: ... (would be generated later or on demand)
            // quizId: ...
        });
    }

    return {
        id: Date.now().toString(),
        goal: draft.goal,
        subjects: draft.subjects,
        lessons: lessons,
        active: true,
        title: `Plano de Estudos: ${draft.goal.charAt(0).toUpperCase() + draft.goal.slice(1)}`
    };
}
