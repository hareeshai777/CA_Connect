import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

const callGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    });

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response."
    );
  } catch (err: any) {
    logger.error("Gemini API error", err?.response?.data || err.message);
    throw new Error("AI service unavailable");
  }
};

export const geminiService = {
  chat: async (userMessage: string, context?: string): Promise<string> => {
    const systemContext = `You are an expert CA (Chartered Accountant) assistant for the CA SaaS platform.
    You help clients with taxation, GST, company registration, audits, compliance, and financial planning queries in India.
    Keep responses concise, accurate, and professional. Always mention to consult a CA for specific advice.
    ${context ? `Context: ${context}` : ""}`;

    return callGemini(`${systemContext}\n\nUser: ${userMessage}`);
  },

  recommendCAs: async (
    clientNeeds: string,
    availableCAs: Array<{
      name: string;
      specializations: string[];
      experience: number;
      rating: number;
    }>
  ): Promise<string> => {
    const prompt = `Based on the client's needs: "${clientNeeds}", recommend the best CA professionals from this list:
${JSON.stringify(availableCAs, null, 2)}

Provide a brief recommendation explaining which CA(s) would be most suitable and why. Be concise (max 150 words).`;
    return callGemini(prompt);
  },

  analyzeDocument: async (documentContent: string, documentType: string): Promise<string> => {
    const prompt = `You are a CA document analyst. Analyze this ${documentType} document and provide:
1. A brief summary (2-3 sentences)
2. Key financial figures/dates mentioned
3. Any compliance concerns or action items
4. Recommendations

Document content:
${documentContent.substring(0, 3000)}

Keep the analysis professional and concise.`;
    return callGemini(prompt);
  },

  generateComplianceSuggestions: async (businessDetails: {
    type: string;
    turnover: string;
    industry: string;
  }): Promise<string> => {
    const prompt = `For a ${businessDetails.type} business in ${businessDetails.industry} with turnover of ${businessDetails.turnover},
provide key compliance requirements and deadlines in India including:
- GST compliance
- Income tax requirements
- ROC filings (if applicable)
- Other regulatory requirements

Format as a clear bullet-point list. Be concise and accurate.`;
    return callGemini(prompt);
  },

  answerTaxFAQ: async (question: string): Promise<string> => {
    const prompt = `As an expert Indian CA, answer this tax/finance question concisely and accurately:
"${question}"

Provide a clear, helpful answer. For specific advice, recommend consulting a CA.`;
    return callGemini(prompt);
  },
};
