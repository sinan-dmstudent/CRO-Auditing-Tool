import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);
// User confirmed API is enabled. Using Gemini 2.0 Flash Exp.
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
        temperature: 0.1, // Low temperature for consistent, analytical results
        topK: 40,
        topP: 0.8,
    }
});

/**
 * Generate content using Gemini.
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
export const analyzeContent = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini analysis error:", error);
        throw error;
    }
};
