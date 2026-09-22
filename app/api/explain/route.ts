import { NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq";
import { getHintAndExplanation, detectCognitiveMisconception } from "@/lib/explanations";

type ParsedExplanation = {
  hint: string;
  steps: string[];
  misconception: string | null;
};

function isParsedExplanation(value: unknown): value is ParsedExplanation {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.hint === "string" &&
    Array.isArray(v.steps) &&
    v.steps.every((s) => typeof s === "string") &&
    v.steps.length >= 2 &&
    (v.misconception === null || typeof v.misconception === "string")
  );
}

function fallbackExplanation(
  questionText: string,
  topicName: string,
  correctOption: string,
  selectedOption: string | null
) {
  const base = getHintAndExplanation(questionText, topicName, correctOption);
  const misconception =
    selectedOption && selectedOption !== correctOption
      ? detectCognitiveMisconception(topicName, selectedOption, correctOption)
      : null;
  return { ...base, misconception, source: "fallback" as const };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { questionText, topicName, options, correctIdx, selectedIdx, lang } = body as {
    questionText?: string;
    topicName?: string;
    options?: string[];
    correctIdx?: number;
    selectedIdx?: number | null;
    lang?: "en" | "ta";
  };

  if (
    !questionText ||
    !topicName ||
    !Array.isArray(options) ||
    typeof correctIdx !== "number" ||
    !options[correctIdx]
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const correctOption = options[correctIdx];
  const selectedOption =
    typeof selectedIdx === "number" && options[selectedIdx] ? options[selectedIdx] : null;

  const client = getGroqClient();
  if (!client) {
    return NextResponse.json(
      fallbackExplanation(questionText, topicName, correctOption, selectedOption)
    );
  }

  const languageInstruction =
    lang === "ta"
      ? "Write every string in Tamil (தமிழ்), in the natural register a Tamil-medium Class 8 textbook would use. Keep numbers, mathematical symbols, and variable names (x, %, etc.) as they are — do not transliterate them."
      : "Write every string in English.";

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are a patient Class 8 Mathematics tutor. Reply with ONLY a JSON object of the exact shape {"hint": string, "steps": string[], "misconception": string | null} — no prose outside the JSON.',
        },
        {
          role: "user",
          content: `A student is practicing the topic "${topicName}".

Question: ${questionText}
Options: ${options.map((o, i) => `${i}: ${o}`).join(", ")}
Correct answer: ${correctOption}
${selectedOption ? `The student selected the wrong answer: ${selectedOption}` : "The student has not answered yet."}

Give:
1. "hint": one short sentence nudging the student toward the right method, without revealing the final numeric answer.
2. "steps": 3 to 5 short step-by-step lines deriving the answer for THIS specific question (not a generic description of the topic), ending with the correct answer stated explicitly.
3. "misconception": if the student selected a wrong answer, one sentence diagnosing the specific mistake that would lead to that exact wrong option for this specific question; otherwise null.

${languageInstruction}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Groq returned no content");

    const parsed: unknown = JSON.parse(raw);
    if (!isParsedExplanation(parsed)) throw new Error("Groq output did not match expected shape");

    return NextResponse.json({ ...parsed, source: "llm" });
  } catch (err) {
    console.error("LLM explanation failed, using static fallback:", err);
    return NextResponse.json(
      fallbackExplanation(questionText, topicName, correctOption, selectedOption)
    );
  }
}
