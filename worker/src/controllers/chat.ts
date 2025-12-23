import { Request, Response } from 'express';
import { vectorStore } from '../services/vectorStore.js';
import { generateAnswer } from '../services/llm.js';

export const chatHandler = async (req: Request, res: Response) => {
    try {
        const { documentId, question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        console.log(`Processing chat for doc: ${documentId}, Question: ${question}`);

        // 1. Retrieve relevant chunks
        const relevantDocs = await vectorStore.similaritySearch(question, 4); // Top 4 chunks
        const context = relevantDocs.map((d: any) => d.pageContent).join('\n\n');

        // 2. Generate Answer
        const answer = await generateAnswer(question, context);

        res.status(200).json({ answer, context: relevantDocs });

    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
};
