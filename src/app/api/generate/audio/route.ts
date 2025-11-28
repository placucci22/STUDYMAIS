import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize client with credentials from env
const client = new TextToSpeechClient();

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const request = {
            input: { text: text },
            // Select the language and SSML voice gender (optional)
            voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B' }, // Neural2-B is a good male voice
            // select the type of audio encoding
            audioConfig: { audioEncoding: 'MP3' as const },
        };

        // Performs the text-to-speech request
        const [response] = await client.synthesizeSpeech(request);

        if (!response.audioContent) {
            throw new Error("No audio content received");
        }

        // Return as base64
        const audioBase64 = Buffer.from(response.audioContent).toString('base64');
        const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

        return NextResponse.json({
            audioUrl,
            duration: text.length * 0.08 // Rough estimate: 1 char ~ 80ms? No, let's just mock duration or calculate better client side.
            // Actually, we can't easily get duration from TTS API without decoding.
            // Let's send the blob and let the client figure it out, or send a rough estimate.
        });

    } catch (error: any) {
        console.error('TTS Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
