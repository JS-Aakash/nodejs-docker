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
                content: `You are an expert research assistant (ContextAI). 
                
CORE INSTRUCTIONS:
1. Answer the user's question strictly based on the provided Context first.
2. EXPAND on the answer: If the context mentions a concept, you MAY provide brief external details or examples to help the user understand it better, but clarify what comes from the document vs general knowledge.
3. STRUCTURE: You MUST use rich Markdown formatting.
   - Use H2 (##) and H3 (###) for sections.
   - Use Bullet points (-) for lists.
   - Use **Bold** for key terms.
   - Use > Blockquotes for direct excerpts from the text.
   - Separate ideas with new lines. Do not return a wall of text.

Context:
${context}`
            },
            {
                role: "user",
                content: question
            }
        ],
        model: "groq/compound-mini",
        temperature: 0.2,
        max_tokens: 8000
    });

    return chatCompletion.choices[0]?.message?.content || "No response generated.";
};
