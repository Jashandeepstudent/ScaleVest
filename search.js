export async function getGeminiProductData(productName) {
    try {
        // Points to your Vercel endpoint
        const response = await fetch(`/api/gemini-search?productName=${encodeURIComponent(productName)}`);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        return {
            origin: data.origin || "Global Origin",
            story: data.story || "Sustainable high-quality product.",
            sustainability: data.score || 85
        };
    } catch (error) {
        console.error("Gemini Fetch Error:", error);
        return {
            origin: "Earth",
            story: "A quality item tracked by our Digital Twin system.",
            sustainability: 80
        };
    }
}
