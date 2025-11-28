import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // Initialize client with credentials from Environment Variable (JSON string)
        // This is required for Vercel/Serverless environments where we can't easily have a key file.
        let credentials;
        if (process.env.GOOGLE_CREDENTIALS_JSON) {
            try {
                credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
            } catch (e) {
                console.error("Failed to parse GOOGLE_CREDENTIALS_JSON", e);
                throw new Error("Invalid Server Credentials Configuration");
            }
        }

        // If no env var, it will try to look for the file (fallback for local dev if configured that way)
        const client = new TextToSpeechClient({ credentials });

        const request = {
            input: { text: text },
            voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B' },
            audioConfig: { audioEncoding: 'MP3' as const },
        };

        const [response] = await client.synthesizeSpeech(request);

        if (!response.audioContent) {
            throw new Error("No audio content received");
        }

        const audioBase64 = Buffer.from(response.audioContent).toString('base64');
        const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

        return NextResponse.json({
            audioUrl,
            duration: text.length * 0.08
        });

    } catch (error: any) {
        console.error('TTS Error:', error);
        return NextResponse.json({ error: error.message || "TTS Failed" }, { status: 500 });
    }
}
