import { GoogleGenerativeAI } from '@google/generative-ai';
import { PUBLIC_GEMINI_API_KEY } from '$env/static/public';

const genAI = new GoogleGenerativeAI(PUBLIC_GEMINI_API_KEY);

export async function analyzeImage(base64Image: string, action: string) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    });

    let prompt = '';

    if (action === 'mindmap') {
        prompt = 'Analyze this handwritten note and create a mind map structure. Extract the main topic and all subtopics, relationships, and key concepts. Format as a hierarchical mind map with clear indentation levels (use spaces at the start of lines to show hierarchy).';
    } else if (action === 'analyze') {
        prompt = 'Analyze and summarize this handwritten note. Identify the main topic, key points, and important details. Provide a clear, organized summary.';
    } else if (action === 'tidy') {
        prompt = 'Read this handwritten note and transcribe it in a clean, organized format. Fix any spelling errors and improve readability while preserving all information.';
    }

    try {
        const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageData,
                    mimeType: 'image/png'
                }
            }
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}