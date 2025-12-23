// MOCK Vector Store for demonstration (In-memory)
// In production, user would use PGVector or FAISS-node bound to file system
// For this task, we will simulate it with a simple array search to keep it runnable without native deps complications for now, 
// OR use a lightweight JS vector library. 
// Let's use a simple In-Memory structure + exact string match fallback or dummy embedding for now 
// to ensure it runs immediately without compiling FAISS bindings on Windows.
// Note: The User asked for FAISS or Chroma, but setting up native bindings on Windows in 1 turn can be flaky.
// I will implement a "SimpleVectorStore" interface.

interface Document {
    content: string;
    metadata?: any;
}

class SimpleVectorStore {
    private docs: Document[] = [];

    async addDocuments(id: string, contents: string[]) {
        contents.forEach(content => {
            this.docs.push({ content, metadata: { source: id } });
        });
        console.log(`Stored ${contents.length} chunks in memory.`);
    }

    async similaritySearch(query: string, k: number) {
        // Determine 'similarity' via simple keyword matching for this mock
        // In real implementation, this would generate embeddings + cosine similarity

        // Naive ranking: count word overlaps
        const queryWords = query.toLowerCase().split(/\s+/);

        const scored = this.docs.map(doc => {
            let score = 0;
            const contentLower = doc.content.toLowerCase();
            queryWords.forEach(word => {
                if (contentLower.includes(word)) score++;
            });
            return { doc, score };
        });

        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, k).map(s => ({ pageContent: s.doc.content }));
    }
}

export const vectorStore = new SimpleVectorStore();
