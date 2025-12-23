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

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`LLM attempt ${attempt}/${maxRetries}`);

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
                max_tokens: 4000
            });

            const response = chatCompletion.choices[0]?.message?.content;

            if (!response || response.trim().length === 0) {
                throw new Error("Empty response from LLM");
            }

            console.log(`LLM success on attempt ${attempt}`);
            return response;

        } catch (error: any) {
            lastError = error;
            console.error(`LLM attempt ${attempt} failed:`, error.message);

            // Check if it's a rate limit error
            if (error.message?.includes('429') || error.message?.includes('rate limit')) {
                const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            // Check if it's a timeout
            if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
                console.log(`Timeout on attempt ${attempt}. Retrying...`);
                continue;
            }

            // For other errors, don't retry
            break;
        }
    }

    // All retries failed - return helpful error message
    console.error('All LLM attempts failed:', lastError);

    if (lastError?.message?.includes('429') || lastError?.message?.includes('rate limit')) {
        return "⚠️ **Rate Limit Reached**\n\nThe AI service is currently experiencing high demand. Please try again in a few moments.";
    }

    if (lastError?.message?.includes('timeout')) {
        return "⚠️ **Request Timeout**\n\nYour question is taking longer than expected to process. Try asking a more specific question or breaking it into smaller parts.";
    }

    return `⚠️ **Unable to Generate Response**\n\nI encountered an issue while processing your question. Please try:\n- Asking a more specific question\n- Rephrasing your query\n- Trying again in a moment\n\nError: ${lastError?.message || 'Unknown error'}`;
};
