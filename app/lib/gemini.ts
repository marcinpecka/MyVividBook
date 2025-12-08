import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "MOCK_KEY");

// Using gemini-2.0-flash-exp as requested for Gemini 2.0 features
// fallback to gemini-pro-vision or similar if needed later
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
