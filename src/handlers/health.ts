import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
    console.log('Health check invoked');

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: 'healthy',
            message: 'AI Document Intelligence System is Online',
            stage: event?.requestContext?.stage || 'unknown',
            timestamp: new Date().toISOString(),
        }),
    };
};
