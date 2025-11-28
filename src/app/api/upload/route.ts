import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const pdfParser = new PDFParser(null, true); // true = text only

        const parsedText = await new Promise<string>((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                // Extract text from the raw data
                const text = pdfParser.getRawTextContent();
                resolve(text);
            });

            pdfParser.parseBuffer(buffer);
        });

        return NextResponse.json({
            text: parsedText,
            info: {}, // pdf2json doesn't give easy metadata like pdf-parse, but text is what matters
            pages: 0 // We can extract this if needed but let's keep it simple
        });

    } catch (error: any) {
        console.error('PDF Parse Error:', error);
        return NextResponse.json({ error: error.message || "Failed to parse PDF" }, { status: 500 });
    }
}
