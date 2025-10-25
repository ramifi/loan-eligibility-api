// src/services/AgentService.ts
import { getOpenAI, OPENAI_MODEL } from "../config/openai";
import { CrimeGradeResult } from "../entities/CrimeGrade";
import { CrimeAnalysisService } from "./CrimeAnalysisService";

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export async function gradeAddressWithAgent(address: string): Promise<CrimeGradeResult> {
  const system = [
    "You are an address safety grader.",
    "You return a CrimeGrade-style letter grade (A–F).",
    "Prefer concise JSON only. Do not include extra prose.",
    "Use the provided tool to perform the actual grading.",
    'Output must be a single JSON object matching the schema: { "address": string, "zip"?: string, "overall_grade": string, "components"?: { "violent_crime"?: string, "property_crime"?: string }, "notes"?: string, "evidence"?: [{ "source"?: string, "snippet": string }] }'
  ].join("\n");

  const first = await getOpenAI().chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Grade this address like CrimeGrade: "${address}"` }
    ],
    // tools: [
    //   {
    //     type: "function",
    //     function: {
    //       name: "grade_address",
    //       description: "Return a CrimeGrade-style result for an address using the internal CrimeAnalysisService.",
    //       parameters: {
    //         type: "object",
    //         properties: { address: { type: "string" } },
    //         required: ["address"]
    //       }
    //     }
    //   }
    // ],
    // tool_choice: "auto"
  });

  let msg = first.choices[0]?.message;

  if (!msg) {
    throw new Error("No response from OpenAI");
  }

  // If the model decided to call our tool:
  if (msg.tool_calls && msg.tool_calls.length > 0) {
    for (const call of msg.tool_calls as ToolCall[]) {
      if (call.type === "function" && call.function.name === "grade_address") {
        const args = JSON.parse(call.function.arguments);
        const result = await CrimeAnalysisService.analyzeCrimeForAgent(args.address);
        const toolResponse = JSON.stringify(result);

        const second: any = await getOpenAI().chat.completions.create({
          model: OPENAI_MODEL,
          temperature: 0.1,
          messages: [
            { role: "system", content: system },
            { role: "user", content: `Grade this address like CrimeGrade: "${address}"` },
            msg,
            {
              role: "tool",
              tool_call_id: call.id,
              content: toolResponse
            }
          ]
        });

        msg = second.choices[0]?.message;
        if (!msg) {
          throw new Error("No response from OpenAI");
        }
      }
    }
  }

  const text = (msg.content || "").toString().trim();
  // If model returned non-JSON, try best-effort extraction
  const jsonText = text.startsWith("{") ? text : text.slice(text.indexOf("{"));
  return JSON.parse(jsonText) as CrimeGradeResult;
}