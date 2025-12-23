import { S3Event, Context } from 'aws-lambda';

export const handler = async (event: S3Event, context: Context): Promise<void> => {
    const ec2Url = process.env.EC2_API_URL;

    if (!ec2Url) {
        console.error('EC2_API_URL environment variable is not defined');
        return;
    }

    const processingEndpoint = `${ec2Url}/ingest`;

    console.log(`Received S3 event with ${event.Records.length} records`);

    for (const record of event.Records) {
        try {
            const bucket = record.s3.bucket.name;
            const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

            console.log(`Triggering processing for File: ${key} in Bucket: ${bucket}`);

            const payload = {
                bucket,
                key,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(processingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Source': 'aws-lambda'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(`EC2 returned error for ${key}: ${response.status} ${response.statusText}`);
                const text = await response.text();
                console.error('Response body:', text);
                // We might want to throw here to trigger Lambda retry behavior, 
                // but for now let's just log it to avoid infinite loops if it's a permanent error.
            } else {
                console.log(`Successfully triggered processing for ${key}`);
            }

        } catch (error) {
            console.error('Error processing record:', error);
        }
    }
};
