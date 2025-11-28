import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(req: NextRequest) {
    try {
        console.log("Starting PDF Processing from URL...");
        const { fileUrl } = await req.json();

        if (!fileUrl) {
            return NextResponse.json({ error: 'No fileUrl provided' }, { status: 400 });
        }

        console.log(`Downloading PDF from: ${fileUrl}`);
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const pdfParser = new PDFParser(null, true); // true = text only

        const parsedText = await new Promise<string>((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                // Extract text from the raw data
                const text = pdfParser.getRawTextContent();
                console.log(`PDF Parsed. Text Length: ${text.length}`);
                resolve(text);
            });

            pdfParser.parseBuffer(buffer);
        });

        return NextResponse.json({
            text: parsedText,
            info: {},
            pages: 0
        });

    } catch (error: any) {
        console.error('PDF Parse Error:', error);
        return NextResponse.json({ error: error.message || "Failed to parse PDF" }, { status: 500 });
    }
}
