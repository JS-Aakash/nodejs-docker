// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const processPdf = async (buffer: Buffer) => {
    const data = await pdf(buffer);
    const text = data.text;

    // Chunking
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1200,
        chunkOverlap: 200,
    });

    const output = await splitter.createDocuments([text]);
    return output.map(doc => doc.pageContent); // Simplified for now, returning string[]
};
