// Quick test script to verify Groq model availability
const Groq = require('groq-sdk').default;
require('dotenv').config({ path: './worker/.env' });

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function testModel(modelName) {
    console.log(`\n🧪 Testing model: ${modelName}`);
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Say 'Hello' if you can hear me."
                }
            ],
            model: modelName,
            max_tokens: 50
        });

        console.log(`✅ SUCCESS: ${modelName}`);
        console.log(`Response: ${completion.choices[0]?.message?.content}`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${modelName}`);
        console.log(`Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Testing Groq Models...\n');

    const modelsToTest = [
        'groq/compound-mini',
        'groq/compound',
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
        'mixtral-8x7b-32768'
    ];

    for (const model of modelsToTest) {
        await testModel(model);
    }

    console.log('\n✨ Test complete!');
}

main().catch(console.error);
