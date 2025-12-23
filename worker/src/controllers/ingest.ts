import { Request, Response } from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { vectorStore } from '../services/vectorStore.js';
import { processPdf } from '../services/pdfProcessor.js';
import { Readable } from 'stream';

const s3 = new S3Client({});

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
};

export const ingestHandler = async (req: Request, res: Response) => {
    try {
        const { bucket, key, documentId } = req.body;
        console.log(`Ingesting document: ${key} from bucket: ${bucket}`);

        // 1. Download from S3
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3.send(command);

        if (!response.Body) throw new Error('Empty S3 Body');

        // Convert stream to buffer for pdf-parse
        const pdfBuffer = await streamToBuffer(response.Body as Readable);

        // 2. Extract & Chunk
        const chunks = await processPdf(pdfBuffer);

        // 3. Store Vectors
        await vectorStore.addDocuments(documentId || key, chunks);

        console.log(`Successfully ingested ${chunks.length} chunks for ${key}`);
        res.status(200).json({ message: 'Ingestion successful', chunkCount: chunks.length });

    } catch (error: any) {
        console.error('Ingest error:', error);
        res.status(500).json({ error: error.message });
    }
};
