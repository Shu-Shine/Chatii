const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Or another suitable Gemini model
});

const generationConfig = {
    temperature: 0.9, // Adjust creativity (0-1)
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048, // Adjust max response length
};

// Basic safety settings (adjust as needed)
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Function to get a response from Gemini
async function getChatbotResponse(prompt, history = []) {
    try {
        // For simple prompts:
        // const result = await model.generateContent(prompt);
        // const response = await result.response;
        // return response.text();

        // For conversational context (better):
        const chat = model.startChat({
            generationConfig,
            safetySettings,
            history: history, // Pass previous turns [{ role: "user", parts: [{text: "..."}]}, { role: "model", parts: [{text: "..."}]}]
        });

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        console.log("Gemini Response Received");
        return response.text();

    } catch (error) {
        console.error("Error interacting with Gemini API:", error);
        // You might want different error messages based on the error type
        if (error.message.includes('SAFETY')) {
             return "I cannot respond to that due to safety restrictions.";
        }
        return "Sorry, I encountered an error and couldn't respond.";
    }
}

module.exports = { getChatbotResponse };