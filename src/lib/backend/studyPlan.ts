import { StudyPlanDraft, StudyPlan, Lesson } from "@/context/AppContext";

export async function generateStudyPlan(draft: StudyPlanDraft): Promise<StudyPlan> {
    try {
        const response = await fetch('/api/generate/plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(draft),
        });

        if (!response.ok) {
            throw new Error('Failed to generate plan via API');
        }

        const data = await response.json();

        return {
            id: Date.now().toString(),
            goal: draft.goal,
            subjects: draft.subjects,
            lessons: data.lessons.map((l: any, i: number) => ({
                ...l,
                id: `lesson-${Date.now()}-${i}`,
                status: i === 0 ? 'unlocked' : 'locked'
            })),
            schedule: data.schedule,
            active: true,
            title: `Plano: ${draft.goal.slice(0, 30)}...`
        };
    } catch (error) {
        console.error("Error in generateStudyPlan:", error);
        throw error;
    }
}
