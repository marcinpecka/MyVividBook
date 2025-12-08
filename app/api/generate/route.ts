import { model } from "@/app/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt, imageUrl } = await req.json();

        if (!model) {
            return NextResponse.json(
                { error: "Gemini model not initialized" },
                { status: 500 }
            );
        }

        let result;
        const systemInstruction =
            "You are an expert SVG artist. Create a children's coloring page based on the user's prompt. " +
            "Return ONLY the raw SVG code. No markdown, no code blocks, no explanation. " +
            "The SVG must have a viewBox, use black strokes (stroke-width: 2), and white or transparent fill. " +
            "Keep it simple and suitable for printing.";

        if (imageUrl) {
            // Modify existing image (Vision capabilities)
            // Note: Gemini outputs text/code. We can ask it to generate an SVG *inspired* by the image + prompt,
            // or we ask it to describe changes. 
            // For this attempt, we'll ask it to recreate/modify the scene as an SVG.

            // 1. Fetch the image to pass to Gemini
            const fileRes = await fetch(imageUrl);
            const arrayBuffer = await fileRes.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString('base64');
            const mimeType = fileRes.headers.get("content-type") || "image/png";

            result = await model.generateContent([
                systemInstruction,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                },
                `Create a coloring page SVG based on this image, but apply this modification: ${prompt}`
            ]);

        } else {
            // Generate new
            result = await model.generateContent([
                systemInstruction,
                `Prompt: ${prompt}`
            ]);
        }

        const responseText = result.response.text();

        // Clean up markdown if present
        const svgCode = responseText
            .replace(/```xml/g, '')
            .replace(/```svg/g, '')
            .replace(/```/g, '')
            .trim();

        return NextResponse.json({
            success: true,
            svgCode: svgCode
        });

    } catch (error: any) {
        console.error("Error generating image:", error);
        return NextResponse.json(
            { error: "Failed to generate image: " + error.message },
            { status: 500 }
        );
    }
}
