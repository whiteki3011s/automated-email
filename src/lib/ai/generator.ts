import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { env } from "@/lib/env";
import { FLAW_EXTRACTION_PROMPT, COLD_PITCH_PROMPT } from "./prompts";

export interface GeneratedPitch {
  subject: string;
  bodyText: string;
  flaws: string[];
}

export async function generateAIPitch(
  domain: string,
  scrapedContent: string,
  initialFlaws: string[],
  serviceContext: string
): Promise<GeneratedPitch> {
  let flaws = initialFlaws;

  // 1. Instantiation: Prefer Google Gemini if GOOGLE_API_KEY is configured, else OpenAI
  let llm: any = null;

  if (env.GOOGLE_API_KEY) {
    try {
      llm = new ChatGoogleGenerativeAI({
        apiKey: env.GOOGLE_API_KEY,
        modelName: "gemini-2.0-flash",
        temperature: 0.3,
      });
    } catch (e) {
      console.warn("Failed to initialize ChatGoogleGenerativeAI:", e);
    }
  } else if (env.OPENAI_API_KEY) {
    try {
      llm = new ChatOpenAI({
        openAIApiKey: env.OPENAI_API_KEY,
        modelName: "gpt-4o",
        temperature: 0.3,
      });
    } catch (e) {
      console.warn("Failed to initialize ChatOpenAI:", e);
    }
  }

  // 2. Execute 2-Pass LangChain Pipeline if LLM instance is active
  if (llm) {
    try {
      // Pass 1: Refine Flaw Extraction
      const flawPrompt = PromptTemplate.fromTemplate(FLAW_EXTRACTION_PROMPT);
      const flawInput = await flawPrompt.format({ domain, content: scrapedContent });
      const flawRes = await llm.invoke(flawInput);
      const flawRawText = flawRes.content ? flawRes.content.toString() : "";
      
      const flawMatch = flawRawText.match(/\{[\s\S]*\}/);
      if (flawMatch) {
        const flawParsed = JSON.parse(flawMatch[0]);
        if (Array.isArray(flawParsed.flaws) && flawParsed.flaws.length > 0) {
          flaws = flawParsed.flaws;
        }
      }

      // Pass 2: Generate Pitch Email
      const pitchPrompt = PromptTemplate.fromTemplate(COLD_PITCH_PROMPT);
      const pitchInput = await pitchPrompt.format({
        domain,
        flaws: flaws.join("; "),
        serviceContext,
      });
      const pitchRes = await llm.invoke(pitchInput);
      const pitchRawText = pitchRes.content ? pitchRes.content.toString() : "";
      
      const pitchMatch = pitchRawText.match(/\{[\s\S]*\}/);
      if (pitchMatch) {
        const pitchParsed = JSON.parse(pitchMatch[0]);
        return {
          subject: pitchParsed.subject || `UI recommendation for ${domain}`,
          bodyText: pitchParsed.bodyText || pitchRawText,
          flaws,
        };
      }
    } catch (error) {
      console.warn("LangChain LLM execution failed, falling back to heuristic generator:", error);
    }
  }

  // Fallback Heuristic Generator (when no API keys are provided)
  const primaryFlaw = flaws[0] || "outdated hero UI font and layout spacing";
  const subject = `Quick UI question regarding ${domain}'s ${primaryFlaw.slice(0, 30)}`;
  const bodyText = `Hi there,\n\nI was browsing ${domain} today and noticed a few quick friction points on your homepage — specifically regarding ${primaryFlaw}.\n\nWe specialize in ${serviceContext || "modernizing web applications and scaling conversions"}. We recently helped a similar company double their CTA conversion rate with a 2-week UI overhaul.\n\nWould you be open to a 10-minute chat this Thursday to review a quick mockup I put together?\n\nBest regards,\nAbhay Sharma`;

  return {
    subject,
    bodyText,
    flaws,
  };
}
