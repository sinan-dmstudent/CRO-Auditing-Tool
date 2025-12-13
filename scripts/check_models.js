const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking API Key:", apiKey ? "Found key ending in " + apiKey.slice(-4) : "NOT FOUND");

    if (!apiKey) {
        console.error("No API Key found. Exiting.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching available models...");
        // List models is available on the internal modelManager if not exposed on top level in this version
        // But for @google/generative-ai, it is usually exposed or we have to try standard ones.
        // Actually, the Node SDK doesn't expose a simple listModels on the client yet in all versions.
        // We will try a different approach: Try to generate content with multiple known models and see which one succeeds.

        const modelsToTest = [
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        for (const modelName of modelsToTest) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you there?");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName} is working! Response: ${response.text()}`);
                process.exit(0); // Exit on first success to save time
            } catch (error) {
                console.log(`❌ FAILURE: ${modelName} - ${error.message.split(']')[1] || error.message}`);
            }
        }

    } catch (error) {
        console.error("Critical Error:", error);
    }
}

checkModels();
