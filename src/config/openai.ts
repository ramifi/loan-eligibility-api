// src/config/openai.ts
import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

export const getOpenAI = (): OpenAI => {
  if (!openaiInstance) {
    if (!process.env['OPENAI_API_KEY']) {
      throw new Error("Missing OPENAI_API_KEY environment variable. Please set it in your .env file or environment.");
    }
    openaiInstance = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
  }
  return openaiInstance;
};

export const OPENAI_MODEL = process.env['OPENAI_MODEL'] ?? "gpt-4o-mini";