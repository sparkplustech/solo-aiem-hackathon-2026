import { StudyPlan, StudyQuiz, SummaryNote } from "../types";

/**
 * Service to execute full-stack AI calls easily
 */
export async function summarizeNotes(file?: File, text?: string): Promise<Omit<SummaryNote, "id" | "ownerId" | "createdAt">> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (text) formData.append("text", text);

  const response = await fetch("/api/summarize", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to process lecture notes.");
  }

  return response.json();
}

export async function generateQuiz(text: string): Promise<Omit<StudyQuiz, "id" | "ownerId" | "createdAt">> {
  const response = await fetch("/api/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate study quiz.");
  }

  return response.json();
}

export async function generatePlan(
  subjects: string[],
  examDates: string,
  availableStudyHours: number,
  weakSubjects: string[]
): Promise<Omit<StudyPlan, "id" | "ownerId" | "createdAt">> {
  const response = await fetch("/api/planner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjects, examDates, availableStudyHours, weakSubjects }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate active study plan.");
  }

  return response.json();
}

export async function extractAssignment(
  file?: File,
  text?: string
): Promise<{ title: string; subject: string; deadline: string; priority: "High" | "Medium" | "Low" }> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (text) formData.append("text", text);

  const response = await fetch("/api/assignments/extract", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to extract assignment variables.");
  }

  return response.json();
}

export async function askChatbot(
  message: string,
  history: { role: string; content: string }[],
  studentStatus: { displayName: string; streak: number; totalStudyHours: number; assignmentsCount: number }
): Promise<{ reply: string }> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, studentStatus }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Assistant communication interrupted.");
  }

  return response.json();
}
