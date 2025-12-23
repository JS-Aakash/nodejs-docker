import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';

export const handler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
    try {
        const htmlPath = path.join(__dirname, '../static/index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
            },
            body: html,
        };
    } catch (error) {
        console.error('Error serving static file:', error);
        return {
            statusCode: 500,
            body: 'Internal Server Error',
        };
    }
};
