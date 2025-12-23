import Groq from 'groq-sdk';

export const generateAnswer = async (question: string, context: string): Promise<string> => {
    if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY Missing");
        return "Internal Error: AI Service Configuration Missing";
    }

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    if (!context) return "I couldn't find any relevant information in the uploaded document.";

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `You are a helpful assistant. Use ONLY the following context to answer the user's question. If the answer is not in the context, say so.\n\nContext:\n${context}`
            },
            {
                role: "user",
                content: question
            }
        ],
        model: "llama3-8b-8192", // Use a free/fast model
        temperature: 0.2,
        max_tokens: 500
    });

    return chatCompletion.choices[0]?.message?.content || "No response generated.";
};
