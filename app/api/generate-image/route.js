
import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/gemini';

export const maxDuration = 60; // Allow 1 minute for image generation

export async function POST(request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        console.log(`Generating image for prompt: ${prompt.substring(0, 50)}...`);
        const imageResult = await generateImage(prompt);

        if (!imageResult) {
            return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
        }

        // Check if the result is a URL or Base64
        // If it's a raw text description (which might happen if the model isn't purely image-out),
        // we might need to handle it. 
        // But assuming the model returns a base64 string or URL as text from our wrapper:

        return NextResponse.json({ imageUrl: imageResult });

    } catch (error) {
        console.error("Image Generation API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
