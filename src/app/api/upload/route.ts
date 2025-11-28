import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdf(buffer);

        return NextResponse.json({
            text: data.text,
            info: data.info,
            pages: data.numpages
        });

    } catch (error: any) {
        console.error('PDF Parse Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
