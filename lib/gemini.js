import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 1. Text/Reasoning Model (Gemini 2.0 Flash Exp - Best for API Logic)
const reasoningModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.8,
    }
});

// 2. Visual Model (Gemini 3 Pro Image Preview)
const visualModel = genAI.getGenerativeModel({
    model: "gemini-3-pro-image-preview", // User specified model ID
    generationConfig: {
        temperature: 0.4, // Slightly higher for creativity in visuals
        topK: 40,
        topP: 0.9,
    }
});

/**
 * Analyze text/content using the Reasoning Model (1.5 Pro).
 */
export const analyzeContent = async (prompt) => {
    try {
        const content = Array.isArray(prompt) ? prompt : [prompt];
        const result = await reasoningModel.generateContent(content);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Reasoning error:", error);
        throw error;
    }
};

/**
 * Generate visuals using ONLY the Visual Model (Gemini Nano Banana Pro).
 * STRICT EXCLUSIVITY: No fallbacks allowed.
 * @param {string} prompt 
 */
export const generateVisual = async (prompt) => {
    try {
        const content = Array.isArray(prompt) ? prompt : [prompt];
        const result = await visualModel.generateContent(content);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Nano Banana Pro Generation Failed:", error);
        // Do NOT fallback to any other model.
        throw error;
    }
};
