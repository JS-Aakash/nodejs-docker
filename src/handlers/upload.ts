import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({});
const BUCKET_NAME = process.env.DOCUMENTS_BUCKET;

export const handler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { filename, contentType } = body;

        if (!filename || !contentType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing filename or contentType' }),
            };
        }

        const fileKey = `${uuidv4()}-${filename}`;
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uploadUrl,
                fileKey,
                expiresIn: 300,
            }),
        };
    } catch (error) {
        console.error('Error generating upload URL:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
