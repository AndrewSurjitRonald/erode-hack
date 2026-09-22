import Groq from "groq-sdk";

let client: Groq | null = null;

/** Returns a shared Groq client, or null if no API key is configured. */
export function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!client) client = new Groq();
  return client;
}

export const GROQ_MODEL = "openai/gpt-oss-120b";
