import { Request, Response } from 'express';
import { vectorStore } from '../services/vectorStore.js';
import { generateAnswer } from '../services/llm.js';

export const chatHandler = async (req: Request, res: Response) => {
    try {
        const { documentId, documentIds, question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        // Handle both single ID (legacy) and array of IDs
        const targetIds: string[] = documentIds || (documentId ? [documentId] : []);

        console.log(`Processing chat for docs: ${targetIds.length} target(s)`);

        // 1. Retrieve relevant chunks with filtering
        const relevantDocs = await vectorStore.similaritySearch(question, 12, targetIds.length > 0 ? targetIds : undefined);
        const context = relevantDocs.map((d: any) => d.pageContent).join('\n\n');

        // 2. Generate Answer
        const answer = await generateAnswer(question, context);

        res.status(200).json({ answer, context: relevantDocs });

    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
};
