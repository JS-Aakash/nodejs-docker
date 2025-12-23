import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
    const ec2Url = process.env.EC2_API_URL;

    if (!ec2Url) {
        console.error('EC2_API_URL environment variable is not defined');
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Configuration Error' }),
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { documentId, question } = body;

        // 1. Validation
        if (!documentId || !question) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'documentId and question are required' }),
            };
        }

        // 2. Forward to EC2 Worker
        const processingEndpoint = `${ec2Url}/chat`;
        console.log(`Forwarding query for doc ${documentId} to ${processingEndpoint}`);

        // Set a timeout for the fetch request itself if needed, 
        // though Lambda timeout handles the hard limit.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout (Lambda should be 30s)

        const response = await fetch(processingEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Source': 'aws-lambda-proxy'
            },
            body: JSON.stringify({ documentId, question }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 3. Handle EC2 Response
        const responseData = await response.json();

        if (!response.ok) {
            console.warn(`EC2 returned error: ${response.status}`, responseData);
            // Pass through the status code from the worker, or default to 502 Bad Gateway
            return {
                statusCode: response.status || 502,
                body: JSON.stringify(responseData),
            };
        }

        // 4. Return Success
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responseData),
        };

    } catch (error: any) {
        console.error('Proxy error:', error);

        if (error.name === 'AbortError') {
            return {
                statusCode: 504,
                body: JSON.stringify({ message: 'Upstream Service Timeout' }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
