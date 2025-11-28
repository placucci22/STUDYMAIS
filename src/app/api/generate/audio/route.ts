import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { supabase } from '@/lib/supabase';

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

        const audioBuffer = Buffer.from(response.audioContent);

        // Upload to Supabase
        const fileName = `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
        const { error: uploadError } = await supabase.storage
            .from('audio')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/mpeg',
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase Upload Error:", uploadError);
            throw new Error("Failed to upload audio to storage");
        }

        const { data: { publicUrl } } = supabase.storage
            .from('audio')
            .getPublicUrl(fileName);

        return NextResponse.json({
            audioUrl: publicUrl,
            duration: text.length * 0.08
        });

    } catch (error: any) {
        console.error('TTS Error:', error);
        return NextResponse.json({ error: error.message || "TTS Failed" }, { status: 500 });
    }
}
